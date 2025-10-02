import express from 'express';
import { getSalesSummary } from '../controllers/salesSummaryController';

const router = express.Router();

// Change route to match /api/salessummary (remove extra /salessummary)
router.post('/', getSalesSummary);

export default router;