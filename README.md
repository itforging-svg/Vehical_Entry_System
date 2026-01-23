# Vehicle Entry & Gate Pass Management System

## Overview
A robust, enterprise-grade solution designed for industrial facilities (specifically implemented for **Chandan Steel Ltd**) to track vehicle entries, exits, and security clearances. The system ensures high data integrity, real-time monitoring, and quick gate pass generation.

## Key Features
- **Real-time Monitoring**: Track all active vehicles within the facility.
- **Automated Gate Pass**: Professional, compact print layout with driver photos and vehicle details.
- **Enhanced Search (Autofill)**: Instantly retrieve driver history by Mobile or Aadhar number.
- **Blacklist Management**: Securely block entry for unauthorized or blacklisted vehicles.
- **Detailed Analytics**: Automated duration tracking and status monitoring (In/Out/Pending).
- **Timezone Optimized**: Standardized to IST (Indian Standard Time) across all levels.

## Tech Stack
- **Frontend**: React, Vite, Lucide React (Icons), Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Relational Data Storage).
- **Process Management**: PM2 (Production Stability).

## Project Structure
```text
/
├── backend/            # Express.js API, Controllers, and Migrations
├── frontend/           # React Application (Vite-based)
├── DEPLOYMENT.md       # Step-by-step Production Deployment Guide
└── README.md           # Project Overview
```

## Getting Started

### 1. Installation
Clone the repository and install dependencies in both folders:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Configuration
Create a `.env` file in the `backend` directory with your PostgreSQL credentials:
```env
DB_USER=your_user
DB_HOST=localhost
DB_NAME=vehicle_entry_db
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### 3. Production Deployment
For detailed production instructions, including firewalls and PM2 setup, refer to the **[DEPLOYMENT.md](./DEPLOYMENT.md)** guide.

## Version
Current Version: **v24.1.0**
*Optimized for Chandan Steel Ltd Seamless & Forging Divisions.*
