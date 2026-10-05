const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSocketHandlers = require('./socket/gameSocketHandler');
const seedData = require('./utils/seedData');

// Routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/games', gameRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'QuizArena API Engine', time: new Date() });
});

// Error Handler Middleware
app.use(errorHandler);

// Attach Socket Handlers
setupSocketHandlers(io);

// Start Server & Connect DB
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Auto-seed database if empty
  await seedData();

  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 QuizArena Real-Time Server running on port ${PORT}`);
    console.log(`📡 Socket.IO Engine ready`);
    console.log(`=================================================`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
