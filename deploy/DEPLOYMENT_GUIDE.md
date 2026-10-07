# Hospital Management System (HMS) — Production Deployment & Runbook Guide

This runbook outlines the steps to deploy and operate the **Hospital Management System (HMS)** in high-availability on-premise or cloud environments (Linux Ubuntu/Debian or Windows Server).

---

## 1. System Requirements & Architecture
- **Runtime**: Node.js `>= 18.x LTS` & npm
- **Database Engine**: MySQL Server `>= 8.0`
- **Reverse Proxy / Web Server**: Nginx `>= 1.18`
- **Process Manager**: PM2 (`npm install -g pm2`)
- **System Memory**: Minimum 4GB RAM (8GB+ recommended for production traffic)
- **Disk**: SSD with automated backup partition

---

## 2. Directory Layout
```text
/var/www/hms/
├── backend/                  # Node.js Express REST API
│   ├── .env                  # Production credentials
│   ├── src/                  # Application source
│   └── package.json
├── frontend/                 # Vite React SPA
│   ├── dist/                 # Production compiled client assets
│   └── package.json
├── uploads/                  # Patient documents & attachments
├── backups/                  # Automated SQL snapshot archives
├── scripts/                  # Backup & Disaster recovery verification tools
└── deploy/                   # Nginx, PM2, and deployment configurations
```

---

## 3. Database Initialization & Hardening

1. **Create Dedicated Database & User**:
   ```sql
   CREATE DATABASE hms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'hms_prod_user'@'localhost' IDENTIFIED BY 'YourStrongSecretPassword_123!';
   GRANT ALL PRIVILEGES ON hms_db.* TO 'hms_prod_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Run Schema Migration & Seeding**:
   ```bash
   cd /var/www/hms/backend
   npm install --omit=dev
   npm run db:init
   ```

3. **Verify Seeded Administrator**:
   - Default Username: `admin`
   - Default Password: `Admin@123456`
   - *(Immediately change this password upon initial system boot via `/api/v1/auth/change-password`)*

---

## 4. Backend Deployment via PM2 Cluster

1. **Configure Production Variables**:
   Copy `deploy/.env.production.example` to `backend/.env` and update secrets.

2. **Launch PM2 Cluster**:
   ```bash
   pm2 start deploy/ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

3. **Monitor Status**:
   ```bash
   pm2 status
   pm2 logs hms-backend
   ```

---

## 5. Frontend Production Compilation

1. **Build Static Bundle**:
   ```bash
   cd /var/www/hms/frontend
   npm install
   npm run build
   ```
   *(Compiled bundle is output to `frontend/dist/`)*

---

## 6. Nginx Web Server Configuration

1. **Deploy Configuration**:
   ```bash
   sudo cp deploy/nginx/hms.conf /etc/nginx/sites-available/hms.conf
   sudo ln -s /etc/nginx/sites-available/hms.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Enable SSL via Certbot (Let's Encrypt)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d hospital.yourdomain.com
   ```

---

## 7. Disaster Recovery & Backup Routine

1. **Manual Backup Execution**:
   ```bash
   node /var/www/hms/scripts/backup_db.js
   ```

2. **Automated Daily Crontab Schedule (2:00 AM Daily)**:
   Add to system crontab (`crontab -e`):
   ```cron
   0 2 * * * /usr/bin/node /var/www/hms/scripts/backup_db.js >> /var/log/hms/backup.log 2>&1
   ```

3. **Disaster Recovery Restoration Verification**:
   To verify that backup snapshots can be restored without data loss:
   ```bash
   node /var/www/hms/scripts/verify_restore.js
   ```

---

## 8. Health Check & Diagnostics
- **API Status**: `GET http://localhost:5000/api/v1/health`
- **Application Logs**: `/var/log/hms/backend-error.log` and `/var/log/hms/backend-out.log`
