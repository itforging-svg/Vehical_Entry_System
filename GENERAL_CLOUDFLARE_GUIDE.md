# General Template: Deploying Full-Stack Projects to Cloudflare

This template can be used for any project with a **React Frontend** and a **Node.js/Hono Backend**.

## Project Structure Recommendation

A standard layout for Cloudflare-ready projects:
- `/frontend`: Your React/Vite/Next.js application.
- `/backend`: Your Cloudflare Worker (using Hono or standard fetch).
- `wrangler.toml`: In the `/backend` folder.

---

## Part 1: Backend (Cloudflare Workers)

### 1. Setup
- Use **Hono** for a familiar Express-like API experience on Workers.
- Initialize with: `npm create hono@latest backend`

### 2. Configuration (`wrangler.toml`)
```toml
name = "your-api-name"
main = "src/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = [ "nodejs_compat" ]

[vars]
# Public variables go here
API_VERSION = "v1"
```

### 3. Secrets
Never put passwords or API keys in `wrangler.toml`. Use:
```bash
wrangler secret put DB_PASSWORD
wrangler secret put JWT_SECRET
```

### 4. Deploy
```bash
cd backend
wrangler deploy
```

---

## Part 2: Frontend (Cloudflare Pages)

### 1. Environment Variables in Vite
In your frontend code, use `import.meta.env.VITE_API_URL`.

### 2. Build and Deploy
You can deploy via the CLI:
```bash
cd frontend
# Set the API URL for this build
$env:VITE_API_URL="https://your-api.workers.dev"
npm run build
wrangler pages deploy dist --project-name your-frontend-name
```

---

## Part 3: Database Selection

Cloudflare Workers run on the "Edge", which has some limitations:
1.  **Vercel/Neon**: Great for Postgres with serverless pooling.
2.  **Supabase**: Excellent for DB + Auth + Storage.
3.  **Cloudflare D1**: Native SQL database within Cloudflare (Best for small/medium apps).

---

## Part 4: Common Patterns

### CORS Setup (Hono)
```javascript
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors({
  origin: 'https://your-frontend.pages.dev',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
```

### DB Connection (Postgres/Supabase)
```javascript
import { Client } from 'pg'

// Inside your worker request handler
const client = new Client(env.DATABASE_URL)
await client.connect()
```
