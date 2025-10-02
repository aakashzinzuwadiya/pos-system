import express, { Request, Response } from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database'
});

connection.connect();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Server error');
      }

      if (!isMatch) {
        return res.status(401).send('Invalid email or password');
      }

      const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

export default router;