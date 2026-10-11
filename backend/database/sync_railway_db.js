const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function syncRailwayDb() {
  console.log('🔄 Initializing tables in the default "railway" database...');
  const conn = await mysql.createConnection({
    host: 'nozomi.proxy.rlwy.net',
    port: 26954,
    user: 'root',
    password: 'pTsYfUnzXWqXmqskeBCNMwXMERQngtAv',
    multipleStatements: true
  });

  // Read schema and point directly to `railway` database
  let schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  schema = schema.replace(/CREATE DATABASE IF NOT EXISTS `hms_db`[^;]*;/gi, '');
  schema = schema.replace(/USE `hms_db`;/gi, 'USE `railway`;');

  await conn.query(schema);
  console.log('✅ 24 Tables created in the "railway" database!');
  await conn.end();
}

syncRailwayDb().catch(err => {
  console.error('❌ Error creating tables in railway db:', err);
  process.exit(1);
});
