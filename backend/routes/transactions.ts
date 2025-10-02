import { Router } from 'express';
import { getAllTransactions, updateTransaction } from '../controllers/transactionsController';

const router = Router();

router.get('/', getAllTransactions);
router.put('/:id', updateTransaction);

export default router;
