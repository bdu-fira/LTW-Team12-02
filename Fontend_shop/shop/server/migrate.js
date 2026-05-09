import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL not found in .env'); process.exit(1); }

const pool = mysql.createPool(url);

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Bắt đầu migration: Xóa bảng cũ và tạo lại cấu trúc 6 bảng chuẩn...');

    // Tắt kiểm tra FK để xóa bảng thoải mái
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Xóa bảng cũ (nếu tồn tại)
    await conn.query('DROP TABLE IF EXISTS reviews');
    await conn.query('DROP TABLE IF EXISTS payments');
    await conn.query('DROP TABLE IF EXISTS shipping_details');
    await conn.query('DROP TABLE IF EXISTS order_items');
    await conn.query('DROP TABLE IF EXISTS orders');

    // Bật lại kiểm tra FK
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Bảng 3: orders
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(100),
        status ENUM('pending','completed','cancelled') DEFAULT 'pending',
        total DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tạo bảng orders OK');

    // Bảng 4: order_items
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        product_name VARCHAR(255),
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(15,2) NOT NULL,
        image LONGTEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Tạo bảng order_items OK');

    // Bảng 5: shipping_details
    await conn.query(`
      CREATE TABLE IF NOT EXISTS shipping_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL UNIQUE,
        customer_name VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tạo bảng shipping_details OK');

    // Bảng 6: payments
    await conn.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL UNIQUE,
        method VARCHAR(50),
        status ENUM('pending','paid','failed') DEFAULT 'pending',
        paid_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tạo bảng payments OK');

    // Bảng reviews (SCRUM-104)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_email VARCHAR(100),
        rating TINYINT NOT NULL DEFAULT 5,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tạo bảng reviews OK');

    console.log('\n🎉 Migration thành công! Database đã có đủ 6 bảng chuẩn hóa:');
    console.log('   1. users');
    console.log('   2. products');
    console.log('   3. orders');
    console.log('   4. order_items');
    console.log('   5. shipping_details');
    console.log('   6. payments');
    console.log('   + reviews (bonus)');

    conn.release();
    process.exit(0);
  } catch (err) {
    conn.release();
    console.error('❌ Migration thất bại:', err.message);
    process.exit(1);
  }
}

migrate();
