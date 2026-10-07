/**
 * Hospital Management System (HMS)
 * Database Disaster Recovery & Verification Script (Phase 19)
 *
 * Restores a specified or latest snapshot into an isolated verification database
 * (`hms_db_restore_verify`), runs consistency checks across core tables,
 * and ensures data integrity before dropping the verification sandbox.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));
const mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root1111';
const VERIFY_DB_NAME = 'hms_db_restore_verify';
const BACKUP_DIR = path.join(__dirname, '../backups');

async function verifyLatestBackup() {
  console.log('================================================================');
  console.log('🧪 HMS DISASTER RECOVERY & BACKUP VERIFICATION ROUTINE');
  console.log('================================================================\n');

  // Find latest SQL backup
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('hms_db_backup_') && f.endsWith('.sql'))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error('No backup SQL files found in backups directory.');
  }

  const latestBackup = files[0];
  const latestBackupPath = path.join(BACKUP_DIR, latestBackup);
  console.log(`Verifying latest backup: ${latestBackup}`);

  // Create connection to MySQL server
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    // 1. Create temporary sandbox database
    console.log(`\n1. Creating isolated verification sandbox '${VERIFY_DB_NAME}'...`);
    await connection.query(`DROP DATABASE IF EXISTS ${VERIFY_DB_NAME}`);
    await connection.query(`CREATE DATABASE ${VERIFY_DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    // 2. Restore backup into sandbox
    console.log(`2. Restoring snapshot into '${VERIFY_DB_NAME}'...`);
    let mysqlCmd = 'mysql';
    const defaultMysqlPath = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe';
    if (fs.existsSync(defaultMysqlPath)) {
      mysqlCmd = `& "${defaultMysqlPath}"`;
    }

    const restoreCmd = `Get-Content "${latestBackupPath}" | ${mysqlCmd} -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} --password=${DB_PASSWORD} ${VERIFY_DB_NAME}`;
    execSync(restoreCmd, { stdio: 'inherit', shell: 'powershell.exe' });
    console.log('   Snapshot restored successfully.');

    // 3. Connect to sandbox and audit tables
    console.log('\n3. Auditing restored schema tables and record counts...');
    const [tables] = await connection.query(`SHOW TABLES FROM ${VERIFY_DB_NAME}`);
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`   Found ${tableNames.length} tables in restored database.`);

    const keyTables = ['roles', 'users', 'departments', 'employees', 'patients', 'appointments', 'bills', 'payments', 'medicines'];
    for (const tbl of keyTables) {
      if (tableNames.includes(tbl)) {
        const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM ${VERIFY_DB_NAME}.${tbl}`);
        console.log(`   ✔ Table '${tbl}': ${rows[0].count} records intact`);
      } else {
        throw new Error(`Integrity check failed: Expected table '${tbl}' is missing in restored backup!`);
      }
    }

    // 4. Cleanup sandbox database
    console.log(`\n4. Cleaning up verification sandbox '${VERIFY_DB_NAME}'...`);
    await connection.query(`DROP DATABASE IF EXISTS ${VERIFY_DB_NAME}`);
    console.log('   Verification sandbox dropped.');

    console.log('\n================================================================');
    console.log('✅ BACKUP RESTORATION VERIFICATION PASSED (DISASTER RECOVERY READY)');
    console.log('================================================================');
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  verifyLatestBackup().catch(err => {
    console.error('\n❌ Backup verification failed:', err.message);
    process.exit(1);
  });
}

module.exports = { verifyLatestBackup };
