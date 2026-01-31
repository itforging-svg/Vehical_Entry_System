import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getSupabaseClient } from '../utils/db.js';

const blacklist = new Hono();

// All blacklist routes are protected
blacklist.use('/*', authMiddleware);

// GET ALL
blacklist.get('/', async (c) => {
    try {
        const supabase = getSupabaseClient(c.env);
        const { data, error } = await supabase
            .from('vehicle_blacklist')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return c.json(data);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// ADD TO BLACKLIST
blacklist.post('/', async (c) => {
    try {
        const { vehicle_no, reason } = await c.req.json();
        const supabase = getSupabaseClient(c.env);

        const { data, error } = await supabase
            .from('vehicle_blacklist')
            .insert([{
                vehicle_no: vehicle_no.toUpperCase(),
                reason,
                created_by: c.get('userId')
            }])
            .select()
            .single();

        if (error) throw error;
        return c.json(data, 201);
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

// REMOVE FROM BLACKLIST
blacklist.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabaseClient(c.env);

        const { error } = await supabase
            .from('vehicle_blacklist')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return c.json({ message: 'Removed from blacklist successfully' });
    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

export default blacklist;
