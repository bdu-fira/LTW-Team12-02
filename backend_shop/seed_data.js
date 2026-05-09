import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const SEED_DB = async () => {
  try {
    console.log('🔄 Đang kết nối vào cơ sở dữ liệu test2...');
    const pool = mysql.createPool({
      host: '127.0.0.1',
      user: 'root',
      password: 'nambule10',
      database: 'test2',
      port: 3306,
    });

    console.log('🗑️ Xóa dữ liệu cũ (nếu có)...');
    
    // Create tables just in case they don't exist yet
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        old_price DECIMAL(15,2),
        is_flash_sale BOOLEAN DEFAULT FALSE,
        sold_count INT DEFAULT 0,
        stock_count INT DEFAULT 0,
        category VARCHAR(100),
        image LONGTEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM users');

    console.log('📦 Đang sinh dữ liệu Sản phẩm (30 sản phẩm)...');
    const productsData = [
      // Điện thoại
      ['iPhone 15 Pro Max 256GB', 34990000, 38990000, true, 450, 15, 'Điện thoại', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'Siêu phẩm Apple với chip A17 Pro, khung viền Titan và camera Tele 5x vượt trội.'],
      ['iPhone 15 128GB', 22990000, 25990000, false, 320, 45, 'Điện thoại', 'https://images.unsplash.com/photo-1695048064971-ebdd95379f87?w=500', 'Màn hình Dynamic Island, camera 48MP, cổng sạc USB-C hoàn toàn mới.'],
      ['Samsung Galaxy S24 Ultra', 33990000, 36990000, true, 280, 20, 'Điện thoại', 'https://images.unsplash.com/photo-1706692550183-f8a1564883f3?w=500', 'Quyền năng Galaxy AI, thiết kế phẳng hiện đại cùng bút S-Pen mạnh mẽ.'],
      ['Samsung Galaxy Z Fold5', 40990000, 44990000, false, 85, 10, 'Điện thoại', 'https://images.unsplash.com/photo-1693309995540-cddfa531b46a?w=500', 'Màn hình gập đỉnh cao, bản lề Flex không kẽ hở, chip Snapdragon 8 Gen 2 for Galaxy.'],
      ['Xiaomi 14 Pro 5G', 22990000, 24990000, false, 150, 25, 'Điện thoại', 'https://images.unsplash.com/photo-1707908027732-c651e4431e77?w=500', 'Camera Leica cao cấp, hiệu năng cực đỉnh với vi xử lý Snapdragon 8 Gen 3.'],
      ['Oppo Find N3 Flip', 22990000, null, true, 95, 12, 'Điện thoại', 'https://images.unsplash.com/photo-1708450131109-17cbb88a29ed?w=500', 'Điện thoại gập phong cách, màn hình ngoài lớn, cụm 3 camera Hasselblad.'],
      ['iPhone 14 Pro 128GB', 25990000, 29990000, false, 650, 8, 'Điện thoại', 'https://images.unsplash.com/photo-1663465374335-db72f7791404?w=500', 'Trang bị Dynamic Island, chip A16 Bionic và camera 48MP đột phá.'],
      ['Samsung Galaxy A54 5G', 9490000, 10490000, true, 420, 50, 'Điện thoại', 'https://images.unsplash.com/photo-1679051515259-7157833a6f19?w=500', 'Thiết kế cao cấp, camera chống rung quang học OIS cực mượt.'],
      ['Google Pixel 8 Pro', 26500000, null, false, 55, 18, 'Điện thoại', 'https://images.unsplash.com/photo-1698246377755-1317d7b1ec1f?w=500', 'Bậc thầy nhiếp ảnh di động với sức mạnh từ chip Google Tensor G3 và công nghệ AI.'],
      ['iPhone 13 128GB', 15990000, 18990000, true, 890, 60, 'Điện thoại', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500', 'Siêu phẩm giá tốt với camera chéo đặc trưng và hiệu năng A15 Bionic vẫn rất mạnh mẽ.'],

      // Laptop
      ['MacBook Air M2 8GB/256GB', 26500000, 29990000, true, 420, 30, 'Laptop', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'Thiết kế mỏng nhẹ hoàn toàn mới, vi xử lý M2 mạnh mẽ đáp ứng mọi nhu cầu cơ bản.'],
      ['MacBook Pro 14 M3 Pro', 49990000, 54990000, false, 120, 15, 'Laptop', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'Dành cho dân chuyên nghiệp, sức mạnh vượt trội từ M3 Pro và màn hình Liquid Retina XDR.'],
      ['Dell XPS 15 9530', 45990000, null, false, 45, 10, 'Laptop', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', 'Thiết kế viền siêu mỏng, màn hình OLED sắc nét, cấu hình cao cấp với Intel Core i7 thế hệ 13.'],
      ['ASUS ROG Zephyrus G14', 38990000, 42990000, true, 90, 20, 'Laptop', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', 'Laptop gaming mỏng nhẹ, chip Ryzen 9 mạnh mẽ và card đồ họa RTX 4060.'],
      ['Lenovo ThinkPad X1 Carbon Gen 11', 42000000, null, false, 60, 12, 'Laptop', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500', 'Bàn phím huyền thoại, mỏng nhẹ, độ bền chuẩn quân đội, lý tưởng cho doanh nhân.'],
      ['HP Spectre x360 14', 35990000, 38990000, false, 75, 25, 'Laptop', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', 'Thiết kế xoay gập 360 độ cực kỳ sang trọng, hỗ trợ bút cảm ứng mượt mà.'],
      ['Acer Predator Helios Neo 16', 29990000, 32990000, true, 180, 40, 'Laptop', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500', 'Sức mạnh chiến game đỉnh cao với tản nhiệt tiên tiến và cấu hình mạnh mẽ trong phân khúc.'],
      ['MSI Cyborg 15 A12V', 21990000, 24990000, true, 210, 35, 'Laptop', 'https://images.unsplash.com/photo-1593642702821-c823b2811cad?w=500', 'Laptop gaming có thiết kế trong suốt độc đáo, giá cả hợp lý với cấu hình tốt.'],

      // Phụ kiện / Thiết bị khác
      ['AirPods Pro Gen 2', 5990000, 6990000, true, 580, 100, 'Thiết bị gia dụng', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', 'Tai nghe chống ồn chủ động đỉnh cao của Apple với hộp sạc MagSafe có loa.'],
      ['Sony WH-1000XM5', 7490000, 8490000, false, 240, 45, 'TV & Âm thanh', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 'Chống ồn hàng đầu thế giới, âm thanh High-Resolution và thiết kế hoàn toàn mới.'],
      ['Apple Watch Series 9 41mm', 9990000, 10990000, true, 310, 50, 'Thiết bị gia dụng', 'https://images.unsplash.com/photo-1434493789847-290229a9a182?w=500', 'Màn hình sáng gấp đôi, thao tác Double Tap ma thuật và theo dõi sức khỏe toàn diện.'],
      ['Samsung Galaxy Watch 6 Classic', 7990000, null, false, 150, 40, 'Thiết bị gia dụng', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500', 'Vòng bezel vật lý xoay cổ điển đã trở lại, màn hình lớn hơn và tính năng sức khỏe cực xịn.'],
      ['iPad Pro M2 11 inch WiFi 128GB', 21990000, 23990000, false, 190, 25, 'Máy tính bảng', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', 'Sức mạnh M2 mang đến hiệu năng như một chiếc laptop, màn hình Liquid Retina tuyệt đẹp.'],
      ['Bàn phím cơ Logitech MX Mechanical', 3990000, 4490000, true, 320, 60, 'Thiết bị gia dụng', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', 'Gõ phím siêu mượt, kết nối tối đa 3 thiết bị cùng lúc, đèn nền tự động cảm biến.'],
      ['Chuột Logitech MX Master 3S', 2490000, null, false, 410, 80, 'Thiết bị gia dụng', 'https://images.unsplash.com/photo-1615663245857-ac1eeb5304ba?w=500', 'Chuột hoàn hảo cho lập trình viên và designer, cuộn vô cực siêu nhanh và nút bấm silent.'],
      ['Màn hình LG UltraFine 4K 27 inch', 12990000, 14990000, true, 120, 20, 'TV & Âm thanh', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 'Màu sắc cực chuẩn, sạc USB-C 90W tiện lợi, phù hợp hoàn hảo với MacBook.'],
      ['Samsung Smart TV 4K 65 inch', 18990000, 22990000, false, 85, 10, 'TV & Âm thanh', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', 'Tận hưởng hình ảnh sắc nét chuẩn 4K, công nghệ màu sắc sống động và hệ điều hành Tizen mượt mà.'],
      ['Robot hút bụi Roborock S8 Pro Ultra', 24990000, 29990000, true, 95, 15, 'Gia dụng', 'https://images.unsplash.com/photo-1589051475736-a36c843343c4?w=500', 'Tự động giặt giẻ, sấy khô, hút bụi với lực hút siêu mạnh, tự động làm trống hộp bụi.'],
      ['Máy lọc không khí Dyson Purifier', 16990000, null, false, 65, 20, 'Gia dụng', 'https://images.unsplash.com/photo-1614846436660-84c1b1819717?w=500', 'Lọc sạch bụi mịn PM0.1, khử mùi hôi, quạt mát với thiết kế không cánh hiện đại và an toàn.'],
      ['Nồi chiên không dầu Philips XXL', 4990000, 6990000, true, 350, 40, 'Gia dụng', 'https://images.unsplash.com/photo-1604581454516-7788bcefc880?w=500', 'Chiên rán giòn rụm với ít hoặc không cần dầu, công nghệ loại bỏ chất béo thừa.']
    ];

    for (const p of productsData) {
      await pool.query(
        'INSERT INTO products (name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        p
      );
    }

    console.log('👥 Đang sinh dữ liệu Người dùng (15 người dùng)...');
    
    // Create an admin first
    const adminSalt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', adminSalt);
    await pool.query(
      'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['Quản trị viên Tối cao', 'admin@shop.com', adminPass, '0987654321', 'admin']
    );

    // Create customers
    const names = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Quỳnh Dung', 'Hoàng Minh Ân', 'Đặng Tuấn Phong', 'Vũ Hải Yến', 'Đoàn Nhật Nam', 'Bùi Xuân Hinh', 'Lý Hải', 'Trịnh Thăng Bình', 'Đỗ Mỹ Linh', 'Mai Phương Thúy', 'Ngô Thanh Vân'];
    
    for (let i = 0; i < names.length; i++) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('123456', salt); // Default password for all seed users
      const email = `user${i+1}@gmail.com`;
      const phone = `09012345${i.toString().padStart(2, '0')}`;
      
      await pool.query(
        'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [names[i], email, password, phone, 'user']
      );
    }

    console.log('✅ SEED DỮ LIỆU THÀNH CÔNG! Đã chèn 30 sản phẩm và 15 users.');
    process.exit(0);

  } catch (error) {
    console.error('❌ LỖI SEED DỮ LIỆU:', error.message);
    process.exit(1);
  }
};

SEED_DB();
