import { Router } from 'express';
import { getAllProducts, addProduct, updateProduct } from '../controllers/productsController';

const router = Router();

router.get('/', getAllProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);

export default router;
