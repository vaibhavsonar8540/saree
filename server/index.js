const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { rawBodyMiddleware } = require('./middleware/rawBodyMiddleware');
const { startStockCleanupScheduler } = require('./jobs/stockCleanupJob');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const sareeRoutes = require('./routes/sareeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const couponRoutes = require('./routes/couponRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Start periodic stock reservation cleanup scheduler
startStockCleanupScheduler(60000); // Check every 60 seconds

// CORS Allowed Origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3030',
  'http://localhost:3031',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, origin);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Guest-Token', 'X-Idempotency-Key', 'X-Razorpay-Signature', 'X-Razorpay-Event-Id'],
  exposedHeaders: ['X-Guest-Token', 'x-guest-token'],
};

// Core Middleware
app.use(cors(corsOptions));

// Capture raw body ONLY for webhook route BEFORE global express.json parser
app.use('/api/payment/webhook', rawBodyMiddleware);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Root Welcome & Health Check Routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Saree E-Commerce Backend API is active and running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      sarees: '/api/sarees',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      payment: '/api/payment',
      shipping: '/api/shipping',
    },
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Saree Backend API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Saree Backend API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/sarees', sareeRoutes);
app.use('/api/products', sareeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/wishlist', favouriteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/coupons', couponRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
