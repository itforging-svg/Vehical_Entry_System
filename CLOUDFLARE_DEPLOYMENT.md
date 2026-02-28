# Cloudflare Deployment Guide - Vehicle Entry System

This guide explains how to deploy the Frontend and Backend to Cloudflare.

## 1. Backend (Cloudflare Workers)

The backend is located in `backend-worker`. It uses **Hono** and connects to your database via environment variables.

### Prerequisites
- Install Wrangler: `npm install -g wrangler`
- Log in to Cloudflare: `wrangler login`

### Steps
1.  **Navigate to backend-worker**:
    ```bash
    cd backend-worker
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Secrets**:
    Run these commands to add your sensitive environment variables:
    ```bash
    wrangler secret put SUPABASE_SERVICE_ROLE_KEY
    wrangler secret put JWT_SECRET
    wrangler secret put DB_USER
    wrangler secret put DB_HOST
    wrangler secret put DB_NAME
    wrangler secret put DB_PASSWORD
    wrangler secret put DB_PORT
    ```
4.  **Deploy**:
    ```bash
    wrangler deploy
    ```
    *Note: Your API will be available at `https://vehicle-entry-api.<your-subdomain>.workers.dev`*

---

## 2. Frontend (Cloudflare Pages)

The frontend is a React application built with Vite.

### Steps
1.  **Navigate to frontend**:
    ```bash
    cd frontend
    ```
2.  **Build the project**:
    You need to set the `VITE_API_URL` to your Cloudflare Worker URL.
    ```bash
    # Replace with your actual worker URL
    $env:VITE_API_URL="https://vehicle-entry-api.<your-subdomain>.workers.dev"
    npm run build
    ```
3.  **Deploy to Pages**:
    You can deploy via the Cloudflare Dashboard or using Wrangler:
    ```bash
    wrangler pages deploy dist --project-name vehicle-entry-frontend
    ```

---

## 3. Database Requirements

Ensure your PostgreSQL instance (e.g., Supabase) allows connections from Cloudflare's IP ranges or use a connection pooling service that supports serverless environments.

### Supabase Setup
- Ensure the `vehicle_entry_db` exists.
- The Worker connects via the `DB_*` variables provided in secrets.

## 4. Troubleshooting

- **CORS Issues**: Ensure the `origin` in `backend-worker/src/index.js` is set to your Pages URL or `*`.
- **Database Connection**: Cloudflare Workers require standard TCP connections (unless using Hyperdrive). If your DB doesn't support direct TCP from Workers, consider using a DB proxy or Supabase's HTTP API (if the code is adapted).
