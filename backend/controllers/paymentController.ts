import { Request, Response } from 'express';
import { savePayment } from '../services/paymentService';

export const processPayment = async (req: Request, res: Response) => {
  const paymentDetails = req.body;

  try {
    const result = await savePayment(paymentDetails);
    res.json(result);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};