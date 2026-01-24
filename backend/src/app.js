import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { connectDB, mongoose } from './config/db.js';

const app = express();

// Middleware
// Enable parse JSON bodies with a limit
app.use(express.json({ limit: '50mb' }));

// Health Check
// Endpoint to verify the server and database connection status
app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: state === 1 ? 'ok' : 'degraded',
    dbState: states[state] || 'unknown',
  });
});

// Routes
// Register API routes for products and transactions
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);

export { app, connectDB };
