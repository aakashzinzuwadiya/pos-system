import { Request, Response } from 'express';
import databaseconnection from '../../config/databaseconnection'; // Ensure this points to the centralized DB

export const getSalesSummary = async (req: Request, res: Response) => {
    let { startDate, endDate } = req.body;
    
    // Default to today's date if not provided
    const today = new Date().toISOString().slice(0, 10);
    startDate = startDate || today;
    endDate = endDate || today;
    const startTimestamp = `${startDate} 00:00:00`;
    const endTimestamp = `${endDate} 23:59:59`;

    const query = `
        SELECT 
            DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS date,
            SUM(CASE WHEN t.payment_method = 'Cash' THEN i.price * i.quantity ELSE 0 END) AS Cash,
            SUM(CASE WHEN t.payment_method = 'Card' THEN i.price * i.quantity ELSE 0 END) AS Card,
            SUM(CASE WHEN t.payment_method = 'Guest' THEN i.price * i.quantity ELSE 0 END) AS Guest,
            SUM(i.price * i.quantity) AS totalRevenue,
            SUM(i.quantity) AS totalQuantitySold
        FROM transactions t
        JOIN transaction_items i ON t.id = i.transaction_id
        WHERE t.transaction_date BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m-%d')
        ORDER BY DATE_FORMAT(t.transaction_date, '%Y-%m-%d');
    `;

    try {
        const [results]: any[] = await databaseconnection.query(query, [startTimestamp, endTimestamp]);
        let data: any;
        if (!results || results.length === 0) {
            data = {
                [today]: {
                    Cash: 0,
                    Card: 0,
                    Guest: 0
                }
            };
        } else {
            data = (results as any[]).reduce((acc: any, row: any) => {
                acc[row.date] = {
                    Cash: Number(row.Cash) || 0,
                    Card: Number(row.Card) || 0,
                    Guest: Number(row.Guest) || 0
                };
                return acc;
            }, {});
        }

        res.json(data);
    } catch (error: any) {
        console.error('Error fetching sales summary:', error?.message || error);
        res.status(500).json({ error: error?.message || 'Failed to fetch sales summary' });
    }
};
