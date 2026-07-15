import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import http from 'http';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { Server as SocketIO } from 'socket.io';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import imagesRoutes from './routes/images.js';
import menuRoutes from './routes/menu.js';
import ordersRoutes from './routes/orders.js';

dotenv.config();

const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Store io instance globally for controllers
global.io = io;

// Middleware
app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/bookings', bookingRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('📱 New user connected:', socket.id);

  socket.on('subscribe-order', (orderId) => {
    socket.join(`order-${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('📴 User disconnected:', socket.id);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? '❌ Server error' : `❌ ${err.message}`;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API URL: http://localhost:${PORT}/api`);
});
