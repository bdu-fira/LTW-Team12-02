import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'nambule10'
  });
  
  const [rows] = await conn.query('SHOW DATABASES');
  console.log('Các database hiện có:', rows);
  await conn.end();
}

check();
