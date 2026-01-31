import { Hono } from 'hono';
import bcrypt from 'bcryptjs-react';
import { sign } from 'hono/jwt';
import { getSupabaseClient } from '../utils/db.js';

const auth = new Hono();

// LOGIN
auth.post('/login', async (c) => {
    try {
        const { username, password } = await c.req.json();
        const supabase = getSupabaseClient(c.env);

        const { data: user, error } = await supabase
            .from('system_users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return c.json({ message: 'User not found' }, 404);
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return c.json({ accessToken: null, message: 'Invalid password' }, 401);
        }

        const token = await sign(
            {
                id: user.id,
                role: user.role,
                plant: user.plant,
                exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
            },
            c.env.JWT_SECRET
        );

        return c.json({
            id: user.id,
            username: user.username,
            role: user.role,
            plant: user.plant,
            accessToken: token
        });

    } catch (err) {
        console.error('Login error:', err);
        return c.json({ message: err.message }, 500);
    }
});

// REGISTER (Admin only)
auth.post('/register', async (c) => {
    try {
        const { username, password, role, plant } = await c.req.json();
        const supabase = getSupabaseClient(c.env);

        const hashedPassword = await bcrypt.hash(password, 8);

        const { data, error } = await supabase
            .from('system_users')
            .insert([
                { username, password: hashedPassword, role, plant }
            ])
            .select()
            .single();

        if (error) {
            return c.json({ message: error.message }, 400);
        }

        return c.json({ message: 'User registered successfully!', user: data }, 201);

    } catch (err) {
        return c.json({ message: err.message }, 500);
    }
});

export default auth;
