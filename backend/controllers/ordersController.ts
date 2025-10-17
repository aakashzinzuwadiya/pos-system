import { Request, Response } from 'express';
import databaseconnection from '../../config/databaseconnection'; // Ensure this points to the centralized DB

// GET /kitchen/orders
export const getKitchenOrders = async (req: Request, res: Response) => {
  try {
    // Fetch all kitchen items, excluding items from deleted transactions, including their isReadyInstances array
    const query = `
      SELECT 
      ti.id AS id,
      ti.transaction_id AS orderId,
      ti.name,
      ti.quantity,
      ti.notifyKitchen,
      ti.isReady,
      ti.isReadyInstances,
      t.transaction_date AS transactionDate
      FROM transaction_items ti
      JOIN transactions t ON t.id = ti.transaction_id
      WHERE ti.notifyKitchen = true
      AND ti.isReady = false
      AND COALESCE(t.is_deleted, 0) = 0
    `;
    const [rows]: any[] = await databaseconnection.query(query);

    // Split each item by quantity for frontend display, and include instanceReady
    const kitchenItems: any[] = [];
    rows.forEach((row: { id: any; orderId: any; name: any; quantity: any; isReadyInstances: any; transactionDate: any; }) => {
      let readyArr: boolean[] = [];
      if (row.isReadyInstances) {
        try {
          readyArr = JSON.parse(row.isReadyInstances);
        } catch {
          readyArr = Array(row.quantity).fill(false);
        }
      } else {
        readyArr = Array(row.quantity).fill(false);
      }
      for (let i = 0; i < row.quantity; i++) {
        kitchenItems.push({
          id: row.id,
          orderId: row.orderId,
          name: row.name,
          instanceIndex: i,
          instanceReady: readyArr[i] === true,
          transactionDate: row?.transactionDate
        });
      }
    });

    res.json(kitchenItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kitchen orders' });
  }
};

export const updateOrderItemReady = async (req: Request, res: Response) => {
    const id = req.body.id;
    const orderId = req.body.orderId;
    const instanceIndex = req.body.instanceIndex;

    try {
        // Fetch current item
        const [rows]: any[] = await databaseconnection.query(
          `SELECT isReadyInstances, quantity FROM transaction_items WHERE id = ? AND transaction_id = ?`,
          [id, orderId]
        );
        if (!rows || rows.length === 0) {
          return res.status(404).json({ error: 'Order item not found.' });
        }

        const quantity = Number(rows[0].quantity) || 1;
        let isReadyInstances: boolean[] = [];
        if (rows[0].isReadyInstances) {
          try {
            isReadyInstances = JSON.parse(rows[0].isReadyInstances);
            if (isReadyInstances.length !== quantity) {
              isReadyInstances = Array(quantity).fill(false);
            }
          } catch {
            isReadyInstances = Array(quantity).fill(false);
          }
        } else {
          isReadyInstances = Array(quantity).fill(false);
        }

        // Mark the specific instance as ready
        if (
          typeof instanceIndex === 'number' &&
          instanceIndex >= 0 &&
          instanceIndex < isReadyInstances.length
        ) {
          isReadyInstances[instanceIndex] = true;
        } else {
          return res.status(400).json({ error: 'Invalid instanceIndex.' });
        }

        const allReady = isReadyInstances.every(Boolean);

        await databaseconnection.query(
          `UPDATE transaction_items SET isReadyInstances = ?, isReady = ? WHERE id = ? AND transaction_id = ?`,
          [JSON.stringify(isReadyInstances), allReady, id, orderId]
        );

        res.json({ success: true, message: 'Order item instance marked as ready.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order item ready status' });
    }
};
