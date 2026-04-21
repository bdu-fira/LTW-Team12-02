import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function fullSetupAndDump() {
  const config = {
    host: '127.0.0.1',
    user: 'root',
    password: 'nambule10'
  };

  try {
    const conn = await mysql.createConnection(config);
    await conn.query('CREATE DATABASE IF NOT EXISTS `database`');
    await conn.query('USE `database`');
    
    console.log('Đang khởi tạo các bảng...');
    
    // Create Tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        image LONGTEXT DEFAULT NULL,
        description TEXT DEFAULT NULL,
        category VARCHAR(100) DEFAULT 'Khác',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
        approved BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        customer_name VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        total_price DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT,
        price DECIMAL(15,2),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        user_name VARCHAR(255),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    console.log('Đang xuất cấu trúc database...');
    let output = `-- SHOP DATABASE EXPORT --\n-- Date: ${new Date().toLocaleString()}\n\n`;
    
    const [tables] = await conn.query('SHOW TABLES');
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      const [createTable] = await conn.query(`SHOW CREATE TABLE ${tableName}`);
      output += `-- Structure for table: ${tableName}\n`;
      output += createTable[0]['Create Table'] + ';\n\n';
    }

    fs.writeFileSync('database_code.sql', output);
    console.log('✅ Đã tạo file database_code.sql thành công!');
    await conn.end();
  } catch (err) {
    console.error('Lỗi:', err.message);
  }
}

fullSetupAndDump();
