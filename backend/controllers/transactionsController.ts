import { Request, Response } from 'express';
import dbConnection from '../../config/databaseconnection';

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const [transactions]: any = await dbConnection.query(
      `SELECT id, email, is_deleted, order_id as orderId, payment_method as paymentMethod, total_amount as totalAmount, transaction_date as date, change_amount as changeAmount
       FROM transactions`
    );

    if (transactions && transactions.length > 0) {
      const transactionIds = transactions.map((t: any) => t.id);

    const [items]: any = await dbConnection.query(
      `SELECT transaction_id as transactionId, item_id as id, name, category, price, quantity
       FROM transaction_items
       WHERE transaction_id IN (?)`,
      [transactionIds]
    );

    const transactionsWithItems = transactions.map((transaction: any) => {
      const transactionItems = items.filter((item: any) => item.transactionId === transaction.id && item.is_deleted !== 1);
      return {
        ...transaction,
        items: transactionItems,
        date: {
          seconds: Math.floor(new Date(transaction.date).getTime() / 1000),
          nanoseconds: new Date(transaction.date).getMilliseconds() * 1e6,
        },
      };
    });

    res.json(transactionsWithItems);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const updateTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updates);
    dbConnection.query(`UPDATE transactions SET ${updateFields} WHERE id = ?`, [...updateValues, id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await dbConnection.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};