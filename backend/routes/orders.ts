import express from 'express';
import {getKitchenOrders, updateOrderItemReady} from '../controllers/ordersController'

const router = express.Router();

router.get('/', getKitchenOrders);
router.post('/order/ready', updateOrderItemReady);

export default router;
