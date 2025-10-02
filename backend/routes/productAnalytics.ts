import express from 'express';
import { getProductAnalytics } from '../controllers/productAnalyticsController';

const router = express.Router();

router.post('/', getProductAnalytics);

export default router;