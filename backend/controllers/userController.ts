import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Replace with your actual secret
import dbConnection from '../../config/databaseconnection';
import { REPLCommand } from 'repl';

const JWT_SECRET = '46e31e08375605d6342387dc2f53651d ';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await dbConnection.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: [any, any] = await dbConnection.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await dbConnection.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role?.toLowerCase()]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dbConnection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await dbConnection.query('DELETE FROM users WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await dbConnection.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role?.toLowerCase()]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const [rows]: [any, any] = await dbConnection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, email: user.email, role: user.role });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

export const handleUpdateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    await dbConnection.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role?.toLowerCase(), id]
    );
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const hardResetTransactions = async (req: Request, res: Response) => {
  try {
    // Reset transactions table
    await dbConnection.query('DELETE FROM sys.transactions WHERE id > 0');
    await dbConnection.query('TRUNCATE TABLE sys.transactions');
    await dbConnection.query('ALTER TABLE sys.transactions AUTO_INCREMENT = 1');

    // Reset transaction_items table
    await dbConnection.query('DELETE FROM sys.transaction_items WHERE id > 0');
    await dbConnection.query('TRUNCATE TABLE sys.transaction_items');
    await dbConnection.query('ALTER TABLE sys.transaction_items AUTO_INCREMENT = 1');

    res.status(200).json({ message: 'Transactions and transaction_items reset successfully' });
  } catch (error) {
    console.error('Error resetting transactions:', error);
    res.status(500).json({ error: 'Failed to reset transactions' });
  }
};