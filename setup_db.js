import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setup() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'nambule10'
    });
    
    console.log('Đang tạo database "database"...');
    await conn.query('CREATE DATABASE IF NOT EXISTS `database`');
    console.log('✅ Đã tạo database thành công!');
    await conn.end();
  } catch (err) {
    console.error('Lỗi khi tạo database:', err.message);
  }
}

setup();
