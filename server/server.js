require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

let server;

connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`🚀 FoodieHub Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('SIGTERM/SIGINT received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

