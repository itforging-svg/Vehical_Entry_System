import { Hono } from 'hono';
import { authMiddleware, getUserContext } from '../middleware/auth.js';
import { getSupabaseClient } from '../utils/db.js';
import { formatToISTString, getRealTimeIST } from '../utils/helpers.js';

const entry = new Hono();

// Private routes require auth
const protectedRoutes = ['/today', '/bydate', '/export', '/:id/exit', '/:id/approve', '/:id/reject', '/:id'];
protectedRoutes.forEach(path => entry.use(path, authMiddleware));

const isSafeIdentifier = (value) => typeof value === 'string' && /^[a-zA-Z0-9._\-\s]{1,100}$/.test(value);


// REGISTER ENTRY (Public - no auth)
entry.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const {
            plant, vehicle_reg, driver_name, license_no, vehicle_type,
            puc_validity, insurance_validity, chassis_last_5, engine_last_5,
            purpose, material_details, transporter, aadhar_no, driver_mobile,
            challan_no, security_person_name, approved_by, photos
        } = body;

        if (!vehicle_reg || typeof vehicle_reg !== 'string' || !vehicle_reg.trim()) {
            return c.json({ message: 'vehicle_reg is required and must be a non-empty string' }, 400);
        }

        if (photos !== undefined && !Array.isArray(photos)) {
            return c.json({ message: 'photos must be an array when provided' }, 400);
        }

        const normalizedVehicleReg = vehicle_reg.trim().toUpperCase();
        const supabase = getSupabaseClient(c.env);

        // 1. Check Blacklist
        const { data: blacklist, error: blError } = await supabase
            .from('vehicle_blacklist')
            .select('*')
            .eq('vehicle_no', normalizedVehicleReg)
            .limit(1);

        if (blError) throw blError;
        if (blacklist && blacklist.length > 0) {
            return c.json({
                message: `BLOCKED: This vehicle is blacklisted.\nReason: ${blacklist[0].reason || 'Not specified'}`
            }, 403);
        }

        // 2. Generate Gate Pass No
        const entry_time = getRealTimeIST();
        const hvTypes = ['Truck', 'Hydra', 'JCB', 'Dumper'];
        const category = hvTypes.some(type => vehicle_type && vehicle_type.includes(type)) ? 'HV' : 'LV';

        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const dateStr = istDate.toISOString().slice(0, 10).split('-').reverse().join(''); // DDMMYYYY

        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
            .from('entry_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today)
            .is('deleted_at', null);

        if (countError) throw countError;
        const seq = (count + 1).toString().padStart(2, '0');
        const gate_pass_no = `CSL-${category}-${dateStr}-${seq}`;

        // 3. Handle Photos (Supabase Storage)
        let finalPhotoUrls = [];
        if (Array.isArray(photos) && photos.length > 0) {
            for (let i = 0; i < photos.length; i++) {
                const photoData = photos[i];
                if (typeof photoData === 'string' && photoData.startsWith('data:image')) {
                    try {
                        const matches = photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (!matches || matches.length < 3) {
                            throw new Error('Invalid base64 image payload');
                        }

                        const mimeType = matches[1];
                        const base64Data = matches[2];

                        // Convert base64 to ArrayBuffer for fetch/upload
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let j = 0; j < binaryString.length; j++) {
                            bytes[j] = binaryString.charCodeAt(j);
                        }

                        const extension = mimeType.split('/')[1] || 'jpg';
                        const fileName = `${gate_pass_no}_${i}_${Date.now()}.${extension}`;

                        const { data, error: uploadError } = await supabase.storage
                            .from('vehicle-photos')
                            .upload(fileName, bytes, {
                                contentType: mimeType,
                                upsert: true
                            });

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from('vehicle-photos')
                            .getPublicUrl(fileName);

                        finalPhotoUrls.push(publicUrl);
                    } catch (e) {
                        console.error('Photo upload failed:', e.message);
                        finalPhotoUrls.push(photoData); // Fallback to base64
                    }
                } else {
                    finalPhotoUrls.push(photoData);
                }
            }
        }

        // 4. Insert Log
        const { data: log, error: insertError } = await supabase
            .from('entry_logs')
            .insert([{
                plant, vehicle_reg: normalizedVehicleReg, driver_name, license_no, vehicle_type,
                puc_validity, insurance_validity, chassis_last_5, engine_last_5,
                purpose, material_details, gate_pass_no, entry_time,
                photo_url: JSON.stringify(finalPhotoUrls), status: 'In',
                transporter, aadhar_no, driver_mobile, challan_no,
                security_person_name, approved_by
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        // Add aliases
        log.timestamp = log.entry_time;
        log.entry_timestamp = log.entry_time;
        log.createdAt = log.created_at;

        return c.json(log, 201);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// GET TODAY'S LOGS
entry.get('/today', async (c) => {
    try {
        const supabase = getSupabaseClient(c.env);
        const { userRole, userPlant } = getUserContext(c);

        const todayStr = new Date().toISOString().split('T')[0];

        let query = supabase
            .from('entry_logs')
            .select('*, vehicle_blacklist(reason)')
            .gte('created_at', todayStr)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (userRole !== 'superadmin' && userPlant) {
            query = query.eq('plant', userPlant);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Format IST
        const rows = data.map(item => {
            const converted = { ...item };
            converted.entry_time = formatToISTString(item.entry_time);
            converted.exit_time = formatToISTString(item.exit_time);
            converted.created_at = formatToISTString(item.created_at);

            return {
                ...converted,
                timestamp: converted.entry_time,
                entry_timestamp: converted.entry_time,
                createdAt: converted.created_at
            };
        });

        return c.json(rows);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// UPDATE EXIT
entry.put('/:id/exit', async (c) => {
    try {
        const id = c.req.param('id');
        const exit_time = getRealTimeIST();
        const supabase = getSupabaseClient(c.env);

        const { data, error } = await supabase
            .from('entry_logs')
            .update({ exit_time, status: 'Out' })
            .eq('id', id)
            .eq('status', 'In')
            .is('deleted_at', null)
            .select()
            .single();

        if (error) return c.json({ message: 'Entry not found or already exited' }, 404);

        // Calculate duration
        if (data.entry_time && data.exit_time) {
            const entry = new Date(data.entry_time);
            const exit = new Date(data.exit_time);
            const diffMs = exit - entry;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            data.duration_minutes = diffMins;
            data.duration = `${hours}h ${mins}m`;
        }

        return c.json(data);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// SOFT DELETE
entry.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabaseClient(c.env);

        const { error } = await supabase
            .from('entry_logs')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        return c.json({ message: 'Deleted successfully' });
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// GET LOGS BY DATE
entry.get('/bydate', async (c) => {
    try {
        const { date } = c.req.query();
        const supabase = getSupabaseClient(c.env);
        const { userRole, userPlant } = getUserContext(c);

        const targetDate = date || new Date().toISOString().split('T')[0];

        let query = supabase
            .from('entry_logs')
            .select('*, vehicle_blacklist(reason)')
            .gte('created_at', `${targetDate}T00:00:00`)
            .lte('created_at', `${targetDate}T23:59:59`)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (userRole !== 'superadmin' && userPlant) {
            query = query.eq('plant', userPlant);
        }

        const { data, error } = await query;
        if (error) throw error;

        const rows = data.map(item => {
            const converted = { ...item };
            converted.entry_time = formatToISTString(item.entry_time);
            converted.exit_time = formatToISTString(item.exit_time);
            converted.created_at = formatToISTString(item.created_at);

            return {
                ...converted,
                timestamp: converted.entry_time,
                entry_timestamp: converted.entry_time,
                createdAt: converted.created_at
            };
        });

        return c.json(rows);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// APPROVE ENTRY
entry.put('/:id/approve', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabaseClient(c.env);
        const { data, error } = await supabase
            .from('entry_logs')
            .update({ approval_status: 'Approved' })
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) return c.json({ message: 'Log not found' }, 404);
        return c.json(data);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// REJECT ENTRY
entry.put('/:id/reject', async (c) => {
    try {
        const id = c.req.param('id');
        const { reason } = await c.req.json();
        const supabase = getSupabaseClient(c.env);
        const { data, error } = await supabase
            .from('entry_logs')
            .update({ approval_status: 'Rejected', rejection_reason: reason })
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) return c.json({ message: 'Log not found' }, 404);
        return c.json(data);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// FIND ONE (Gate Pass or ID)
entry.get('/:id', async (c) => {
    try {
        const identifier = c.req.param('id');
        const supabase = getSupabaseClient(c.env);

        let query = supabase.from('entry_logs').select('*').is('deleted_at', null);

        if (identifier.toUpperCase().startsWith('CSL-')) {
            query = query.eq('gate_pass_no', identifier);
        } else if (!isNaN(identifier)) {
            query = query.eq('id', identifier);
        } else {
            return c.json({ message: 'Invalid identifier format' }, 400);
        }

        const { data, error } = await query.single();
        if (error || !data) return c.json({ message: 'Record not found' }, 404);

        data.timestamp = data.entry_time;
        data.entry_timestamp = data.entry_time;
        data.createdAt = data.created_at;

        return c.json(data);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// FIND DRIVER HISTORY
entry.get('/history/:identifier', async (c) => {
    try {
        const identifier = c.req.param('identifier').trim();
        if (!isSafeIdentifier(identifier)) {
            return c.json({ message: 'Invalid identifier format' }, 400);
        }

        const supabase = getSupabaseClient(c.env);

        const { data, error } = await supabase
            .from('entry_logs')
            .select('driver_name, license_no, driver_mobile, aadhar_no, photo_url, entry_time')
            .or(`driver_mobile.eq.${identifier},aadhar_no.eq.${identifier},driver_name.eq.${identifier},vehicle_reg.eq.${identifier}`)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return c.json({ message: 'No previous records found' }, 404);
        return c.json(data);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// PHOTO PROXY (Redirect to Supabase)
entry.get('/photo/:id/:index', async (c) => {
    try {
        const { id, index } = c.req.param();
        const photoIndex = parseInt(index) || 0;
        const supabase = getSupabaseClient(c.env);

        const { data, error } = await supabase
            .from('entry_logs')
            .select('photo_url')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error || !data.photo_url) return c.json({ message: 'Photo not found' }, 404);

        const photos = JSON.parse(data.photo_url);
        if (!Array.isArray(photos) || photoIndex >= photos.length) {
            return c.json({ message: 'Photo index out of range' }, 404);
        }

        const photoData = photos[photoIndex];
        if (photoData.startsWith('http')) {
            return c.redirect(photoData);
        }

        return c.json({ message: 'Legacy photo format not supported for direct proxy yet' }, 400);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// EXPORT CSV
entry.get('/export', async (c) => {
    try {
        const { userRole } = getUserContext(c);
        if (userRole !== 'superadmin') {
            return c.json({ message: 'Only superadmin can perform this action' }, 403);
        }

        const { range, start, end } = c.req.query();
        const supabase = getSupabaseClient(c.env);

        let query = supabase.from('entry_logs').select('*').is('deleted_at', null);

        if (range === 'custom' && start && end) {
            query = query.gte('created_at', `${start}T00:00:00`).lte('created_at', `${end}T23:59:59`);
        } else {
            let days = range === '7d' ? 7 : range === '15d' ? 15 : range === '30d' ? 30 : 0;
            if (days > 0) {
                const dateLimit = new Date();
                dateLimit.setDate(dateLimit.getDate() - days);
                query = query.gte('created_at', dateLimit.toISOString());
            }
        }

        const { data: logs, error } = await query.order('created_at', { ascending: false });
        if (error || !logs.length) return c.json({ message: 'No records found' }, 404);

        // Generate CSV Content
        const headers = ['ID', 'Gate Pass No', 'Plant', 'Vehicle Reg', 'Vehicle Type', 'Driver Name', 'Entry Time', 'Exit Time', 'Status'];
        let csvContent = headers.join(',') + '\n';

        logs.forEach(log => {
            const row = [
                log.id,
                log.gate_pass_no || '',
                `"${log.plant || ''}"`,
                log.vehicle_reg || '',
                log.vehicle_type || '',
                `"${log.driver_name || ''}"`,
                log.entry_time || '',
                log.exit_time || '',
                log.status || ''
            ];
            csvContent += row.join(',') + '\n';
        });

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=vehicle_logs_${range || 'all'}.csv`
            }
        });
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

export default entry;
