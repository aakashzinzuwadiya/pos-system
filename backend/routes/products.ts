import { Router } from 'express';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../controllers/productsController';

const router = Router();

router.get('/', getAllProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
