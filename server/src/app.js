import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { getAllowedOrigins } from './config/environment.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import adminQuotationRoutes from './routes/adminQuotationRoutes.js';
import estimateRoutes from './routes/estimateRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import adminPortfolioRoutes from './routes/adminPortfolioRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminAppointmentRoutes from './routes/adminAppointmentRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import adminDeliveryRoutes from './routes/adminDeliveryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminReviewRoutes from './routes/adminReviewRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import adminInventoryRoutes from './routes/adminInventoryRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import adminInvoiceRoutes from './routes/adminInvoiceRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import adminMediaRoutes from './routes/adminMediaRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { emailStatus } from './services/emailService.js';

const app = express();
const allowedOrigins = getAllowedOrigins();

app.disable('x-powered-by');
// Enable only when the deployment platform is configured to sit behind a trusted proxy.
// Set TRUST_PROXY=1 on Render or another single-proxy deployment if required by that platform.
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include server-to-server calls and local health checks.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '100kb', parameterLimit: 100 }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/ready'
});
app.use('/api', generalApiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication requests. Please wait and try again.' }
});
app.use('/api/auth', authLimiter);

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    ok: true,
    service: 'Shahnawaz Enterprises API',
    phase: 21,
    timestamp: new Date().toISOString()
  });
});

// Phase 20: readiness indicates whether MongoDB-backed routes can serve requests.
app.get('/api/email/status', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, phase: 21, email: emailStatus() });
});

app.get('/api/ready', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.set('Cache-Control', 'no-store');
  res.status(databaseConnected ? 200 : 503).json({
    ok: databaseConnected,
    service: 'Shahnawaz Enterprises API',
    phase: 21,
    database: databaseConnected ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/admin/quotations', adminQuotationRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin/portfolio', adminPortfolioRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin/appointments', adminAppointmentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin/deliveries', adminDeliveryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin/inventory', adminInventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin/invoices', adminInvoiceRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin/media', adminMediaRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
