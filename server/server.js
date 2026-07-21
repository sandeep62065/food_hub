require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const app = require('./src/app');
const connectDB = require('./src/config/db');

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room order_${orderId}`);
  });

  socket.on('update-location', async ({ orderId, lat, lng }) => {
    // Broadcast to the order room
    socket.to(`order_${orderId}`).emit('location-updated', { lat, lng });
    
    // Update DB
    try {
       const Order = require('./src/models/Order');
       await Order.findByIdAndUpdate(orderId, { partnerLocation: { lat, lng } });
    } catch(err) {
       console.error('Error updating location in DB:', err.message);
    }
  });

  socket.on('send_chat_message', async ({ orderId, message, senderRole, senderId }) => {
    try {
      const ChatMessage = require('./src/models/ChatMessage');
      const chatMsg = await ChatMessage.create({
        order: orderId,
        sender: senderId,
        senderRole,
        message,
      });
      const populatedMsg = await chatMsg.populate('sender', 'name avatarUrl');
      io.to(`order_${orderId}`).emit('receive_chat_message', populatedMsg);
    } catch (err) {
      console.error('Error saving chat message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
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

module.exports = app;

