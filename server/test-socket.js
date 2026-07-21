const { io } = require('socket.io-client');
const mongoose = require('mongoose');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected with ID:', socket.id);
  
  // Fake ObjectIds for test
  const orderId = new mongoose.Types.ObjectId().toString();
  const senderId = new mongoose.Types.ObjectId().toString();

  socket.emit('join-order', orderId);

  socket.on('receive_chat_message', (msg) => {
    console.log('RECEIVED BROADCAST:', msg);
    process.exit(0);
  });

  setTimeout(() => {
    console.log('Sending message...');
    socket.emit('send_chat_message', {
      orderId,
      message: 'Hello from test script!',
      senderRole: 'customer',
      senderId
    });
  }, 1000);
});

socket.on('connect_error', (err) => {
  console.error('Connection Error:', err.message);
  process.exit(1);
});
