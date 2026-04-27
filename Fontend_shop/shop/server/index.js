import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
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
  { id: 1, name: 'iPhone 15 Pro', price: 28990000, old_price: 32000000, is_flash_sale: true, sold_count: 85, stock_count: 15, category: 'Điện thoại', image: 'https://vcdn-sohoa.vnecdn.net/2023/09/13/iphone-15-pro-finish-select-202309-6-5-inch-natural-titanium-1694562098.jpg', description: 'Siêu phẩm Apple 2023' },
  { id: 2, name: 'MacBook Air M2', price: 26500000, old_price: 30000000, is_flash_sale: true, sold_count: 50, stock_count: 50, category: 'Laptop', image: 'https://vcdn-sohoa.vnecdn.net/2022/06/07/macbook-air-m2-4-5690-1654564883.jpg', description: 'Mỏng nhẹ mạnh mẽ' },
  { id: 3, name: 'Samsung Galaxy S24 Ultra', price: 31990000, old_price: 35000000, is_flash_sale: false, sold_count: 120, stock_count: 30, category: 'Điện thoại', image: 'https://vcdn-sohoa.vnecdn.net/2024/01/18/galaxy-s24-ultra-ti-den-3-2470-1705545543.jpg', description: 'Đỉnh cao AI' }
];

async function initDB() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not found');

    pool = mysql.createPool(url);
    
    // Check connection
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ Kết nối database thành công!');

    // Check/Create products table
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

    // Insert mock data if table is empty
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (countRows[0].count === 0) {
      console.log('📦 Đang chèn dữ liệu mẫu vào database...');
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
    if (useMock) return res.json(mockProducts);
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
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

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
