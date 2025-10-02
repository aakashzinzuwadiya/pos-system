import { Request, Response } from 'express';
import dbConnection from '../../config/databaseconnection';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
  const [products] = await dbConnection.query('SELECT * FROM products');
  res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const addProduct = async (req: Request, res: Response) => {
    const { name, category, price, stock } = req.body;
    try {
      await dbConnection.query('INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)', [name, category, price, stock]);
      res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Failed to add product' });
    }
  };

export const updateProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updates);
    dbConnection.query(`UPDATE products SET ${updateFields} WHERE id = ?`, [...updateValues, id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};
