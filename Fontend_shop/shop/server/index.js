import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection string: mysql://root:nambule10@localhost:3306/database
let pool;
let useMock = false;

// Mock data in case DB fails
let mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 28990000, old_price: 32000000, is_flash_sale: true, sold_count: 85, stock_count: 15, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', description: 'Siêu phẩm Apple 2023' },
  { id: 2, name: 'MacBook Air M2', price: 26500000, old_price: 30000000, is_flash_sale: true, sold_count: 50, stock_count: 50, category: 'Laptop', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80', description: 'Mỏng nhẹ mạnh mẽ' },
  { id: 3, name: 'Samsung Galaxy S24 Ultra', price: 31990000, old_price: 35000000, is_flash_sale: false, sold_count: 120, stock_count: 30, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80', description: 'Đỉnh cao AI' }
];

let mockOrders = [];
let mockUsers = [
  { id: 1, full_name: 'Quản trị viên Tối cao', email: 'admin@shop.com', password: 'mockpassword', phone: '0987654321', role: 'admin' },
  { id: 2, full_name: 'Khách hàng', email: 'user@gmail.com', password: 'mockpassword', phone: '0901234567', role: 'user' }
];

async function initDB() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not found');

    pool = mysql.createPool(url);
    await pool.query('SELECT 1');
    console.log('✅ Kết nối database thành công!');

    // Bảng 1: users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('user','admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Bảng 2: products
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL
      )
    `);

    // Bảng 3: orders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(100),
        status ENUM('pending','completed','cancelled') DEFAULT 'pending',
        total DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bảng 4: order_items (chi tiết từng sản phẩm trong đơn)
    await pool.query(`
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

    // Bảng 5: shipping_details (thông tin giao hàng)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipping_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL UNIQUE,
        customer_name VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Bảng 6: payments (thông tin thanh toán)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL UNIQUE,
        method VARCHAR(50),
        status ENUM('pending','paid','failed') DEFAULT 'pending',
        paid_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Bảng 6b: reviews (đánh giá sản phẩm - SCRUM-104)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_email VARCHAR(100),
        rating TINYINT NOT NULL DEFAULT 5,
        comment TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    try {
      await pool.query("ALTER TABLE reviews ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
    } catch(err) {
      // Column might already exist, ignore error
    }

    console.log('✅ Đã khởi tạo đầy đủ 6 bảng chuẩn hóa!');

    // Insert mock products nếu bảng trống
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (countRows[0].count === 0) {
      console.log('📦 Đang chèn dữ liệu mẫu sản phẩm...');
      for (const p of mockProducts) {
        await pool.query(
          'INSERT INTO products (name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, p.price, p.old_price, p.is_flash_sale, p.sold_count, p.stock_count, p.category, p.image, p.description]
        );
      }
    }
  } catch (err) {
    console.warn('❌ Lỗi kết nối database:', err.message);
    console.warn('⚠️ Chuyển sang chế độ MOCK (dữ liệu ảo).');
    useMock = true;
  }
}

initDB();

// API Endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;

    if (useMock) {
      let result = [...mockProducts];
      if (category && category !== 'Tất cả') result = result.filter(p => p.category === category);
      if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
      if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
      if (search) {
        const term = search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
      }
      if (sort === 'priceAsc') result.sort((a, b) => a.price - b.price);
      else if (sort === 'priceDesc') result.sort((a, b) => b.price - a.price);
      else if (sort === 'sold') result.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
      else result.sort((a, b) => b.id - a.id);
      
      return res.json(result);
    }
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (category && category !== 'Tất cả') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(Number(maxPrice));
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (sort === 'priceAsc') query += ' ORDER BY price ASC';
    else if (sort === 'priceDesc') query += ' ORDER BY price DESC';
    else if (sort === 'sold') query += ' ORDER BY sold_count DESC';
    else query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useMock) {
      const product = mockProducts.find(p => String(p.id) === String(id));
      if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
      return res.json(product);
    }
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description } = req.body;
  try {
    if (useMock) {
      const newP = { id: Date.now(), name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description };
      mockProducts.unshift(newP);
      return res.status(201).json(newP);
    }
    const [result] = await pool.query(
      'INSERT INTO products (name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description]
    );
    res.status(201).json({ id: result.insertId, name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description } = req.body;
  try {
    if (useMock) {
      mockProducts = mockProducts.map(p => String(p.id) === String(id) ? { ...p, name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description } : p);
      return res.json({ id, name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description });
    }
    await pool.query(
      'UPDATE products SET name=?, price=?, old_price=?, is_flash_sale=?, sold_count=?, stock_count=?, category=?, image=?, description=? WHERE id=?',
      [name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description, id]
    );
    res.json({ id, name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useMock) {
      const initialLength = mockProducts.length;
      mockProducts = mockProducts.filter(p => String(p.id) !== String(id));
      if (mockProducts.length === initialLength) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm để xóa' });
      }
      return res.status(204).send();
    }
    const [result] = await pool.query('DELETE FROM products WHERE id=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm để xóa' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API Endpoints
app.post('/api/orders', async (req, res) => {
  const { user_email, customer_name, phone, address, total, payment_method, items } = req.body;
  try {
    if (useMock) {
      const newOrder = { id: Date.now(), user_email, customer_name, phone, address, total, payment_method, items, status: 'pending', created_at: new Date().toISOString() };
      mockOrders.unshift(newOrder);
      
      // Update mock products stock
      (items || []).forEach(item => {
        const prod = mockProducts.find(p => String(p.id) === String(item.id));
        if (prod) {
          prod.stock_count -= (item.quantity || 1);
          prod.sold_count += (item.quantity || 1);
        }
      });
      
      return res.status(201).json(newOrder);
    }

    // Dùng Transaction để chèn dữ liệu vào4 bảng cùng lúc
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Bảng 3: orders
      const [orderResult] = await conn.query(
        'INSERT INTO orders (user_email, total, status) VALUES (?, ?, ?)',
        [user_email, total, 'pending']
      );
      const orderId = orderResult.insertId;

      // Bảng 4: order_items và Cập nhật kho hàng
      console.log(`📦 Đang xử lý đơn hàng mới với ${items?.length} mặt hàng...`);
      for (const item of (items || [])) {
        console.log(` - Sản phẩm: ${item.name} (ID: ${item.id}, SL: ${item.quantity})`);
        // Chèn vào chi tiết đơn hàng
        await conn.query(
          'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.id || null, item.name, item.quantity || 1, item.price, item.image || null]
        );

        // Cập nhật số lượng tồn kho và đã bán (nếu có product_id)
        if (item.id) {
          const [updateResult] = await conn.query(
            'UPDATE products SET stock_count = stock_count - ?, sold_count = sold_count + ? WHERE id = ?',
            [item.quantity || 1, item.quantity || 1, item.id]
          );
          console.log(`   ✅ Đã cập nhật kho cho ID ${item.id}. Rows affected: ${updateResult.affectedRows}`);
        } else {
          console.warn(`   ⚠️ Không tìm thấy ID cho sản phẩm ${item.name}, bỏ qua cập nhật kho.`);
        }
      }

      // Bảng 5: shipping_details
      await conn.query(
        'INSERT INTO shipping_details (order_id, customer_name, phone, address) VALUES (?, ?, ?, ?)',
        [orderId, customer_name, phone, address]
      );

      // Bảng 6: payments
      const isPaid = payment_method && payment_method.toLowerCase() !== 'cod';
      await conn.query(
        'INSERT INTO payments (order_id, method, status, paid_at) VALUES (?, ?, ?, ?)',
        [orderId, payment_method, isPaid ? 'paid' : 'pending', isPaid ? new Date() : null]
      );

      await conn.commit();
      conn.release();

      res.status(201).json({ id: orderId, user_email, customer_name, phone, address, total, payment_method, items, status: 'pending' });
    } catch (transErr) {
      await conn.rollback();
      conn.release();
      throw transErr;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (useMock) return res.json(mockOrders);
    const [rows] = await pool.query(`
      SELECT 
        o.id, o.user_email, o.status, o.total, o.created_at,
        sd.customer_name, sd.phone, sd.address,
        p.method AS payment_method,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', oi.id, 'product_id', oi.product_id, 'name', oi.product_name, 'quantity', oi.quantity, 'price', oi.price, 'image', oi.image)
          ) FROM order_items oi WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      LEFT JOIN shipping_details sd ON sd.order_id = o.id
      LEFT JOIN payments p ON p.order_id = o.id
      ORDER BY o.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (useMock) {
      mockOrders = mockOrders.map(o => String(o.id) === String(id) ? { ...o, status } : o);
      return res.json({ id, status });
    }
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:email', async (req, res) => {
  const { email } = req.params;
  try {
    if (useMock) {
      const userOrders = mockOrders.filter(o => o.user_email === email);
      return res.json(userOrders);
    }
    const [rows] = await pool.query(`
      SELECT 
        o.id, o.user_email, o.status, o.total, o.created_at,
        sd.customer_name, sd.phone, sd.address,
        p.method AS payment_method,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', oi.id, 'product_id', oi.product_id, 'name', oi.product_name, 'quantity', oi.quantity, 'price', oi.price, 'image', oi.image)
          ) FROM order_items oi WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      LEFT JOIN shipping_details sd ON sd.order_id = o.id
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.user_email = ?
      ORDER BY o.id DESC
    `, [email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users & Auth API Endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (useMock) {
      const user = mockUsers.find(u => u.email === email);
      if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      return res.json({ email: user.email, name: user.full_name, role: user.role });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    
    res.json({ email: user.email, name: user.full_name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (useMock) {
      if (mockUsers.find(u => u.email === email)) return res.status(400).json({ error: 'Email đã tồn tại' });
      const newUser = { id: Date.now(), full_name: name, email, password: 'mockpassword', phone: '', role: 'user' };
      mockUsers.push(newUser);
      return res.status(201).json({ email: newUser.email, name: newUser.full_name, role: newUser.role });
    }
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email đã tồn tại' });

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    await pool.query('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPass, 'user']);
    res.status(201).json({ email, name, role: 'user' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    if (useMock) {
      return res.json(mockUsers.map(u => ({ email: u.email, name: u.full_name, role: u.role })));
    }
    const [rows] = await pool.query('SELECT email, full_name as name, role FROM users ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  const { name, role } = req.body;
  try {
    if (useMock) {
      mockUsers = mockUsers.map(u => u.email === email ? { ...u, full_name: name, role } : u);
      return res.json({ email, name, role });
    }
    await pool.query('UPDATE users SET full_name = ?, role = ? WHERE email = ?', [name, role, email]);
    res.json({ email, name, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    if (useMock) {
      mockUsers = mockUsers.filter(u => u.email !== email);
      return res.status(204).send();
    }
    await pool.query('DELETE FROM users WHERE email = ?', [email]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews API
app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    if (useMock) return res.json([]);
    const [rows] = await pool.query(
      "SELECT r.id, r.user_email, r.rating, r.comment, r.created_at FROM reviews r WHERE r.product_id = ? AND r.status = 'approved' ORDER BY r.id DESC",
      [productId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  const { user_email, rating, comment } = req.body;
  if (!user_email || !rating) return res.status(400).json({ error: 'Thiếu thông tin đánh giá.' });
  try {
    if (useMock) {
      return res.status(201).json({ id: Date.now(), product_id: productId, user_email, rating, comment, status: 'pending', created_at: new Date().toISOString() });
    }
    const [existing] = await pool.query('SELECT id FROM reviews WHERE product_id = ? AND user_email = ?', [productId, user_email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Bạn đã đánh giá sản phẩm này rồi.' });
    
    const [result] = await pool.query(
      "INSERT INTO reviews (product_id, user_email, rating, comment, status) VALUES (?, ?, ?, ?, 'pending')",
      [productId, user_email, rating, comment]
    );
    res.status(201).json({ id: result.insertId, product_id: productId, user_email, rating, comment, status: 'pending', created_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/reviews', async (req, res) => {
  try {
    if (useMock) return res.json([]);
    const [rows] = await pool.query(`
      SELECT r.id, r.user_email, r.rating, r.comment, r.status, r.created_at, p.name as product_name
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reviews/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (useMock) return res.json({ id, status });
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    res.json({ id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Statistics API
app.get('/api/stats', async (req, res) => {
  try {
    if (useMock) {
      const nonCancelledOrders = mockOrders.filter(o => o.status !== 'cancelled');
      const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalOrdersCount = nonCancelledOrders.length;
      
      let productSales = {};
      let categorySales = {};
      
      nonCancelledOrders.forEach(o => {
        (o.items || []).forEach(item => {
          // product
          if (!productSales[item.name]) productSales[item.name] = { name: item.name, total_sold: 0, revenue: 0 };
          productSales[item.name].total_sold += item.quantity || 1;
          productSales[item.name].revenue += (item.price * (item.quantity || 1));
          
          // category (brand) - we need to look up the product to get category
          const prodId = item.id || item.product_id;
          const prod = mockProducts.find(p => String(p.id) === String(prodId));
          const cat = prod ? prod.category : 'Khác';
          if (!categorySales[cat]) categorySales[cat] = { category: cat, total_sold: 0 };
          categorySales[cat].total_sold += item.quantity || 1;
        });
      });
      
      const topProducts = Object.values(productSales).sort((a, b) => b.total_sold - a.total_sold).slice(0, 5);
      const topBrands = Object.values(categorySales).sort((a, b) => b.total_sold - a.total_sold).slice(0, 5);
      
      return res.json({
        totalRevenue,
        totalOrdersCount,
        topProducts,
        topBrands
      });
    }
    
    // Total Revenue & Orders Count
    const [revenueRows] = await pool.query("SELECT SUM(total) as totalRevenue, COUNT(id) as totalOrdersCount FROM orders WHERE status != 'cancelled'");
    const totalRevenue = revenueRows[0].totalRevenue || 0;
    const totalOrdersCount = revenueRows[0].totalOrdersCount || 0;
    
    // Top Selling Products
    const [topProducts] = await pool.query(`
      SELECT 
        oi.product_name as name, 
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    
    // Top Selling Brands/Categories
    const [topBrands] = await pool.query(`
      SELECT 
        COALESCE(p.category, 'Khác') as category,
        SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status != 'cancelled'
      GROUP BY category
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    
    res.json({
      totalRevenue,
      totalOrdersCount,
      topProducts,
      topBrands
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {

  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
