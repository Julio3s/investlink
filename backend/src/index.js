require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const initDb = require('./config/initDb');
const { trackVisitor } = require('./middleware/analytics');

const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);

// Flexible CORS pour supports localhost, ngrok, et autres
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
      process.env.NGROK_URL,
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
app.use('/api', trackVisitor);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/messaging'));
app.use('/api', require('./routes/misc'));

const appState = {
  db: 'initializing',
};

// Health check
app.get('/api/health', (req, res) => {
  const isReady = appState.db === 'ready';

  res.status(200).json({
    status: isReady ? 'ok' : 'starting',
    db: appState.db,
    timestamp: new Date(),
  });
});

// WebSocket for real-time messaging
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined`);
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
    console.log('Socket disconnected:', socket.id);
  });
});

// Export io for use in controllers
app.set('io', io);
app.set('connectedUsers', connectedUsers);

const PORT = Number(process.env.PORT || process.env.RENDER_PORT || 5000);

const initializeDatabase = async () => {
  try {
    await initDb();
    appState.db = 'ready';
  } catch (err) {
    appState.db = 'error';
    console.error('Database initialization failed:', err);
  }
};

server.listen(PORT, '0.0.0.0', () => {
  console.log(`InvestLink Backend running on port ${PORT}`);
  void initializeDatabase();
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

module.exports = { app, io };
