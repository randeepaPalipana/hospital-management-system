const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  console.log('====================================================');
  console.log('🏥 Hospital Management System — Database Setup Tool');
  console.log('====================================================');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };

  console.log(`Connecting to MySQL host: ${config.host}:${config.port} as '${config.user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server.');

    // 1. Read and run schema.sql
    console.log('\n📄 Executing schema.sql (Creating database and tables)...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Database schema created successfully (23 tables, foreign keys, indexes).');

    // 2. Read and run seed.sql
    console.log('\n🌱 Executing seed.sql (Populating default master data)...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('✅ Master seed data populated successfully.');
    console.log('   - 7 Roles inserted');
    console.log('   - 8 Departments inserted');
    console.log('   - 1 Admin user (admin / Admin@123456)');
    console.log('   - 8 Standard Lab tests inserted');
    console.log('   - 10 Essential medicines & batches inserted');

    console.log('\n🎉 Database initialization finished successfully!');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ Database initialization error:');
    console.error(error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n👉 Access Denied: Please check your MySQL password in backend/.env');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
