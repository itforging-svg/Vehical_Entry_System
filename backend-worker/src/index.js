import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entry.js';
import blacklistRoutes from './routes/blacklist.js';

const app = new Hono();

// Global Middleware
app.use('/*', cors());

// Root path
app.get('/', (c) => {
    return c.text('Vehicle Entry System Edge API (Cloudflare Workers)');
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/entry', entryRoutes);
app.route('/api/blacklist', blacklistRoutes);

export default app;
