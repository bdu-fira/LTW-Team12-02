import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);

const [r] = await pool.query(
  "UPDATE products SET name='Nồi chiên không dầu Philips XXL' WHERE id=30"
);
console.log('Updated:', r.affectedRows, 'rows');

const [rows] = await pool.query('SELECT id, name FROM products WHERE id=30');
console.log(JSON.stringify(rows));

process.exit(0);
