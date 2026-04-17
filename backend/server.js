require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');
const { generateShipToken } = require('./src/config/shipRocket');
const PORT = process.env.PORT || 5002;
let server;

const startServer = async () => {
  await connectDB();

  try {
    await generateShipToken();
  } catch (error) {
    console.warn(`⚠️  Shiprocket auth skipped: ${error.message}`);
  }

  server = app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
    console.log(`📡 Server listening on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log('='.repeat(50));
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the running process or change PORT in backend/.env.`);
      process.exit(1);
    }

    console.error(`❌ Server startup error: ${error.message}`);
    process.exit(1);
  });
};

startServer().catch((error) => {
  console.error(`❌ Failed to start server: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
    return;
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('✅ Process terminated');
    });
    return;
  }
  process.exit(0);
});
