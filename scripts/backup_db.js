/**
 * Hospital Management System (HMS)
 * Database Backup Routine (Phase 19: Disaster Recovery)
 *
 * Runs `mysqldump` to export a full, compressed-compatible SQL snapshot of `hms_db`.
 * Supports automated timestamping, retention cleanup, and integrity validation.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root1111';
const DB_NAME = process.env.DB_NAME || 'hms_db';

const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUP_RETENTION_DAYS = 30;

// Ensure backup destination folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `hms_db_backup_${timestamp}.sql`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  console.log('================================================================');
  console.log('📦 HMS AUTOMATED DATABASE BACKUP ROUTINE');
  console.log('================================================================');
  console.log(`Target Database:  ${DB_NAME}`);
  console.log(`Destination File: ${backupFilePath}`);

  // Look for mysqldump in PATH or standard MySQL 8.0 installation directory
  let mysqldumpCmd = 'mysqldump';
  const defaultMysqlDumpPath = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe';
  if (fs.existsSync(defaultMysqlDumpPath)) {
    mysqldumpCmd = `& "${defaultMysqlDumpPath}"`;
  }

  const dumpCommand = `${mysqldumpCmd} -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} --password=${DB_PASSWORD} --single-transaction --quick --routines --triggers ${DB_NAME} > "${backupFilePath}"`;

  try {
    const startTime = Date.now();
    execSync(dumpCommand, { stdio: 'inherit', shell: 'powershell.exe' });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const stats = fs.statSync(backupFilePath);
    const sizeKb = (stats.size / 1024).toFixed(2);

    if (stats.size === 0) {
      throw new Error('Backup failed: Generated file is empty (0 bytes).');
    }

    console.log(`\n✅ Backup successfully generated in ${duration}s!`);
    console.log(`   File Size: ${sizeKb} KB`);

    // Clean up old backups exceeding retention policy
    cleanOldBackups();

    return backupFilePath;
  } catch (err) {
    console.error('\n❌ Backup generation failed:', err.message);
    process.exit(1);
  }
}

function cleanOldBackups() {
  const now = Date.now();
  const maxAgeMs = MAX_BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(BACKUP_DIR);

  let removedCount = 0;
  for (const file of files) {
    if (file.startsWith('hms_db_backup_') && file.endsWith('.sql')) {
      const fullPath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(fullPath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(fullPath);
        removedCount++;
        console.log(`   Removed expired snapshot: ${file}`);
      }
    }
  }

  if (removedCount > 0) {
    console.log(`🧹 Purged ${removedCount} backup(s) older than ${MAX_BACKUP_RETENTION_DAYS} days.`);
  }
}

if (require.main === module) {
  runBackup();
}

module.exports = { runBackup };
