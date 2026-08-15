const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mainRoutes = require('./routes/mainRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Trust proxy - required for Vercel/reverse proxy deployments
app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());

const allowedOrigins = [
    'https://beauty-glam-five.vercel.app',
    'https://beauty-admin-five.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(null, true); // Fallback to allow during deployment
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true
}));

app.use(helmet());
app.use('/api', limiter);

// Ensure DB is connected for serverless invocations
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection failed:', err.message);
        res.status(500).json({ 
            message: 'Database connection failed. Please ensure MongoDB Atlas IP Whitelist (0.0.0.0/0) and MONGO_URI in Vercel Environment Variables are configured.' 
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/main', mainRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
