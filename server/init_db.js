import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function initDB() {
  // Kết nối không chỉ định database để tạo database mới nếu cần
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'nambule10',
  })

  console.log('🚀 Đang kết nối tới MySQL...')

  const dbName = process.env.MYSQL_DATABASE || 'database'

  try {
    // 1. Tạo Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    console.log(`✅ Đã đảm bảo database "${dbName}" tồn tại.`)

    await connection.query(`USE \`${dbName}\``)

    // 2. Tạo bảng products (SCRUM-86, SCRUM-89)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        image LONGTEXT DEFAULT NULL,
        description TEXT DEFAULT NULL,
        category VARCHAR(100) DEFAULT 'Khác',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL
      )
    `)
    console.log('✅ Đã tạo bảng "products".')

    // 3. Tạo bảng users (SCRUM-85)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
        approved BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL
      )
    `)
    console.log('✅ Đã tạo bảng "users".')

    // 4. Thêm dữ liệu mẫu cho sản phẩm (SCRUM-86)
    const [existingProducts] = await connection.query('SELECT COUNT(*) as count FROM products')
    if (existingProducts[0].count === 0) {
      const sampleProducts = [
        ['iPhone 15 Pro Max', 34990000, 'https://picsum.photos/seed/iphone15/400/300', 'Chip A17 Pro mạnh mẽ, camera 48MP, khung titan siêu bền.', 'Điện thoại'],
        ['MacBook Air M2', 26500000, 'https://picsum.photos/seed/macbook/400/300', 'Thiết kế mỏng nhẹ, hiệu năng vượt trội với chip M2, màn hình Liquid Retina.', 'Laptop'],
        ['AirPods Pro 2nd Gen', 5990000, 'https://picsum.photos/seed/airpods/400/300', 'Chống ồn chủ động gấp 2 lần, âm thanh thích ứng, pin lên đến 30h.', 'Phụ kiện'],
        ['Samsung Galaxy S24 Ultra', 31990000, 'https://picsum.photos/seed/s24/400/300', 'Màn hình 120Hz siêu sáng, bút S-Pen tích hợp, khung viền titan.', 'Điện thoại'],
        ['Sony WH-1000XM5', 8490000, 'https://picsum.photos/seed/sonyh/400/300', 'Tai nghe chống ồn tốt nhất thế giới, thiết kế sang trọng, âm thanh Hi-Res.', 'Phụ kiện']
      ]

      await connection.query(
        'INSERT INTO products (name, price, image, description, category) VALUES ?',
        [sampleProducts]
      )
      console.log('✅ Đã thêm dữ liệu sản phẩm mẫu.')
    }

    // 5. Thêm dữ liệu mẫu cho users (Admin)
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users')
    if (existingUsers[0].count === 0) {
      await connection.query(
        'INSERT INTO users (email, password, name, role, approved) VALUES (?, ?, ?, ?, ?)',
        ['admin@shop.com', 'admin', 'Quản trị viên', 'admin', true]
      )
      console.log('✅ Đã tạo tài khoản admin mẫu (admin@shop.com / admin).')
    }

    console.log('\n✨ HOÀN THÀNH: Hệ thống Database đã sẵn sàng!')
  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error.message)
  } finally {
    await connection.end()
  }
}

initDB()
