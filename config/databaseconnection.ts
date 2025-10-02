import mysql from 'mysql2/promise';

const dbConnection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Admin@123',
  database: 'sys',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default dbConnection;