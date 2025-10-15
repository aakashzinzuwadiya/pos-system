import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productsRouter from './routes/products';
import transactionsRouter from './routes/transactions';
import userRoutes from './routes/users';
import paymentRoutes from './routes/payments';
import productAnalyticsRoutes from './routes/productAnalytics';
import salesSummaryRoutes from './routes/salesSummary';

import dbConnection from '../config/databaseconnection';

import { MACHINE_IP } from '../config/constants';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

dotenv.config();
app.use(cors());
app.use(express.json());

// Connect to MySQL
dbConnection.getConnection()
  .then(() => {
    console.log('Connected to MySQL');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/productanalytics', productAnalyticsRoutes);
app.use('/api/salessummary', salesSummaryRoutes);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(port, MACHINE_IP, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export {};