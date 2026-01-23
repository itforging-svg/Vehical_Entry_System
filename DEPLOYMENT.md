# Vehicle Entry System - Production Deployment Guide

This guide outlines the steps to deploy the Vehicle Entry System (Backend & Frontend) on a Windows Production Server.

## Prerequisites

1.  **Node.js**: Ensure Node.js (v18 or higher) is installed.
2.  **PostgreSQL**: Ensure PostgreSQL is running and the database `vehicle_entry_db` is created.
3.  **Git**: For pulling the latest code.
4.  **PM2**: Process manager for Node.js (install globally: `npm install -g pm2`).
5.  **Serve**: Static file server (install globally: `npm install -g serve`).

---

## 1. Backend Deployment

The backend runs continuously using PM2.

### Steps:
1.  Navigate to the backend directory:
    ```powershell
    cd path\to\Vehical_Entry_System\backend
    ```
2.  Install dependencies (if not already done):
    ```powershell
    npm install
    ```
3.  **Database Migration**: Ensure the database is initialized.
    ```powershell
    npm run init-db
    ```
4.  **Start with PM2**:
    ```powershell
    pm2 start ecosystem.config.js
    ```
5.  **Save PM2 List** (to restart on reboot):
    ```powershell
    pm2 save
    ```

**Monitoring Logs**:
```powershell
pm2 logs vehicle-entry-backend
```

---

## 2. Frontend Deployment

The frontend is built as a static site and served using a simple HTTP server (or IIS/Nginx if preferred). We will use `serve` for simplicity.

### Steps:
1.  Navigate to the frontend directory:
    ```powershell
    cd path\to\Vehical_Entry_System\frontend
    ```
2.  **Build the Project**:
    ```powershell
    npm run build
    ```
    *(This creates a `dist` folder with optimized files)*

3.  **Serve the Application**:
    You can use `serve` to host the `dist` folder on port 5174 (or 80/443 if standard).
    ```powershell
    serve -s dist -l 5174 --ssl-cert "path/to/cert.pem" --ssl-key "path/to/key.pem"
    ```
    *Note: If you don't need SSL at this layer (e.g., behind a proxy), remove the ssl flags.*
    
    **Alternative: Using PM2 to serve Frontend**:
    ```powershell
    pm2 start serve --name "vehicle-entry-frontend" -- -s dist -l 5174
    ```

---

## 3. Network Configuration (Firewall)

Ensure the Windows Firewall allows traffic on the following ports:
-   **5001** (Backend API)
-   **5174** (Frontend UI)
-   **5432** (PostgreSQL)

### PowerShell Command to Open Ports:
```powershell
New-NetFirewallRule -DisplayName "Vehicle Entry System" -Direction Inbound -LocalPort 5001,5174 -Protocol TCP -Action Allow
```

---

## 4. Verification

1.  Open your browser and navigate to: `https://<SERVER_IP>:5174`
2.  Try logging in with `admin_main` / `admin123`.
3.  Check connection status in the footer or console.

## 5. Maintenance Commands

-   **Restart Backend**: `pm2 restart vehicle-entry-backend`
-   **Stop All**: `pm2 stop all`
-   **View Logs**: `pm2 logs`
