import { Request, Response } from 'express';
import databaseconnection from '../../config/databaseconnection'; // Ensure this points to the centralized DB


export const getProductAnalytics = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.body;

  // If startDate or endDate are not provided, default to today's date
  const today = new Date().toISOString().slice(0, 10);
  const start = startDate || today;
  const end = endDate || today;

  // Set timestamps for day start and day end
  const startTimestamp = `${start} 00:00:00`;
  const endTimestamp = `${end} 23:59:59`;

  const query = `SELECT 
    DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS date,
    i.name AS productName,
    SUM(i.quantity) AS totalQuantitySold,
    SUM(i.price * i.quantity) AS totalRevenue
  FROM transactions t
  JOIN transaction_items i ON t.id = i.transaction_id
  WHERE t.transaction_date BETWEEN ? AND ?
  GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m-%d'), i.name
  ORDER BY DATE_FORMAT(t.transaction_date, '%Y-%m-%d'), totalRevenue DESC;`;

  const [rows]: any[] = await databaseconnection.query(query, [startTimestamp, endTimestamp]);

  try {
    const formattedData = rows.reduce((acc: Record<string, any[]>, row: any) => {
      if (!acc[row.date]) {
        acc[row.date] = [];
      }
      acc[row.date].push({
        productName: row.productName,
        totalQuantitySold: row.totalQuantitySold,
        totalRevenue: row.totalRevenue
      });
      return acc;
    }, {});

    const responseData = Object.entries(formattedData).map(([date, products]) => ({
      date,
      products
    }));

    res.json(responseData);
  } catch (error) {
    console.error('Error processing rows:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};
