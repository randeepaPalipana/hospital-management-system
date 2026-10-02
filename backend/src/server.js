const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { testConnection, pool } = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('🏥 Starting Hospital Management System (HMS) Server...');
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('----------------------------------------------------');

  // Verify Database Connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️ Server is starting, but MySQL connection could not be established.');
    console.warn('👉 Please verify your backend/.env database credentials (DB_USER, DB_PASSWORD).');
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 HMS Backend API running on: http://localhost:${PORT}`);
    console.log(`💓 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down HMS Server gracefully...`);
    server.close(async () => {
      console.log('🔌 HTTP server closed.');
      try {
        await pool.end();
        console.log('📦 Database connection pool closed.');
      } catch (err) {
        console.error('Error closing DB pool:', err.message);
      }
      process.exit(0);
    });

    // Force exit after 10s if hung
    setTimeout(() => {
      console.error('⚠️ Force shutdown timed out. Exiting now.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
