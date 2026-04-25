require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Flexible CORS pour supports localhost, ngrok, et autres
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
      process.env.NGROK_URL
    ].filter(Boolean);
    
    // Allow all ngrok URLs
    if (!origin || origin.includes('ngrok') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
};

const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/messaging'));
app.use('/api', require('./routes/misc'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// WebSocket for real-time messaging
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 User ${userId} joined`);
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('send_message', (data) => {
    const { conversation_id, message } = data;
    socket.to(`conversation:${conversation_id}`).emit('new_message', message);
  });

  socket.on('typing', (data) => {
    socket.to(`conversation:${data.conversation_id}`).emit('user_typing', {
      userId: socket.userId,
    });
  });

  socket.on('disconnect', () => {
    if (socket.userId) connectedUsers.delete(socket.userId);
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Export io for use in controllers
app.set('io', io);
app.set('connectedUsers', connectedUsers);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 InvestLink Backend running on port ${PORT}`);
});

module.exports = { app, io };
