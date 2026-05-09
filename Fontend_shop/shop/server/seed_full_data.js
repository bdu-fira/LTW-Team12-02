import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

    // 1. Lấy danh sách sản phẩm và người dùng
    const [products] = await pool.query('SELECT id, name, price, image FROM products');
    const [users] = await pool.query('SELECT email, full_name FROM users');

    if (products.length === 0 || users.length === 0) {
      console.error('❌ Cần có ít nhất 1 sản phẩm và 1 người dùng trong database.');
      process.exit(1);
    }

    const reviewComments = [
      "Sản phẩm rất tốt, giao hàng nhanh!",
      "Chất lượng tuyệt vời, đóng gói cẩn thận.",
      "Giá hơi cao nhưng sắt ra miếng.",
      "Màu sắc đẹp, dùng rất mượt.",
      "Hàng chính hãng, bảo hành đầy đủ.",
      "Sẽ ủng hộ shop lần sau.",
      "Dùng một thời gian thấy rất ổn định.",
      "Quà tặng kèm rất xịn, cảm ơn shop."
    ];

    // 2. Tạo Đánh giá (Reviews) - Mỗi sản phẩm ~2-3 đánh giá
    console.log('⭐ Đang tạo đánh giá...');
    for (const p of products) {
      const numReviews = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numReviews; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const rating = Math.floor(Math.random() * 2) + 4; // 4 hoặc 5 sao
        const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        
        await pool.query(
          'INSERT IGNORE INTO reviews (product_id, user_email, rating, comment) VALUES (?, ?, ?, ?)',
          [p.id, user.email, rating, comment]
        );
      }
    }

    // 3. Tạo Đơn hàng và Lịch sử thanh toán
    console.log('💰 Đang tạo đơn hàng và lịch sử thanh toán...');
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const p = products[Math.floor(Math.random() * products.length)];
        selectedProducts.push(p);
        total += Number(p.price);
      }

      const status = i % 3 === 0 ? 'completed' : (i % 3 === 1 ? 'pending' : 'cancelled');
      
      // Chèn vào bảng orders
      const [orderResult] = await pool.query(
        'INSERT INTO orders (user_email, total, status) VALUES (?, ?, ?)',
        [user.email, total, status]
      );
      const orderId = orderResult.insertId;

      // Chèn vào order_items
      for (const p of selectedProducts) {
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, p.id, p.name, 1, p.price, p.image]
        );
      }

      // Chèn vào shipping_details
      await pool.query(
        'INSERT INTO shipping_details (order_id, customer_name, phone, address) VALUES (?, ?, ?, ?)',
        [orderId, user.full_name || 'Khách hàng', '090123456' + i, '123 Đường ' + i + ', Quận ' + (i+1) + ', TP. HCM']
      );

      // Chèn vào payments
      const methods = ['COD', 'Chuyển khoản', 'Momo', 'VNPay'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const pStatus = status === 'completed' ? 'paid' : 'pending';
      
      await pool.query(
        'INSERT INTO payments (order_id, method, status, paid_at) VALUES (?, ?, ?, ?)',
        [orderId, method, pStatus, pStatus === 'paid' ? new Date() : null]
      );
    }

    console.log('✅ Hoàn tất! Đã thêm đánh giá và 10 đơn hàng mẫu.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi seed data:', err.message);
    process.exit(1);
  }
}

seed();
