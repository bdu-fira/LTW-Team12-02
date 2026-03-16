import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { createPool } from './db.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

let pool
let useMemoryStore = false
let memoryProducts = []

try {
  pool = createPool()

  // Ensure the products table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      image VARCHAR(1024) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tạo bảng users nếu chưa tồn tại
  await pool.query(`
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

  // Thêm dữ liệu mẫu cho bảng users nếu bảng trống
  const [[{ user_count }]] = await pool.query('SELECT COUNT(*) as user_count FROM users');
  if (Number(user_count) === 0) {
    // LƯU Ý: Trong ứng dụng thực tế, mật khẩu phải được mã hóa (hashed)
    await pool.query(`INSERT INTO users (email, password, name, role, approved) VALUES (?, ?, ?, ?, ?)`,
      ['admin@shop.com', 'admin', 'Quản trị viên', 'admin', true]);
    console.log('Đã tạo tài khoản admin mặc định.');
  }
} catch (error) {
  console.warn(
    '⚠️ Could not connect to MySQL. Falling back to in-memory product store.',
  )
  console.warn(error.message)
  useMemoryStore = true
  memoryProducts = [
    {
      id: 1,
      name: 'Tai nghe bluetooth ANC',
      price: 1290000,
      image: 'https://picsum.photos/seed/earbuds/400/300',
      description: 'Tai nghe không dây chống ồn chủ động, pin 30h, sạc nhanh.',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Smartwatch thể thao',
      price: 1890000,
      image: 'https://picsum.photos/seed/smartwatch/400/300',
      description: 'Đo nhịp tim, theo dõi giấc ngủ, chống nước 5ATM.',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Loa Bluetooth di động',
      price: 990000,
      image: 'https://picsum.photos/seed/speaker/400/300',
      description: 'Âm thanh 20W, pin 15 giờ, kết nối nhanh qua NFC.',
      created_at: new Date().toISOString(),
    },
  ]
}

app.get('/api/products', async (req, res) => {
  try {
    if (useMemoryStore) {
      return res.json(memoryProducts.sort((a, b) => (a.id < b.id ? 1 : -1)))
    }

    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('GET /api/products failed', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.post('/api/products', async (req, res) => {
  const { name, price, image, description } = req.body
  if (!name || !price) {
    return res.status(400).json({ error: 'name and price are required' })
  }

  if (useMemoryStore) {
    const nextId = memoryProducts.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const product = {
      id: nextId,
      name,
      price: Number(price),
      image: image || '',
      description: description || '',
      created_at: new Date().toISOString(),
    }
    memoryProducts.unshift(product)
    return res.status(201).json(product)
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price, image, description) VALUES (?, ?, ?, ?)',
      [name, price, image || '', description || ''],
    )

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('POST /api/products failed', error)
    res.status(500).json({ error: 'Failed to add product' })
  }
})

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params
  const numericId = Number(id)
  const { name, price, image, description } = req.body

  if (!numericId || !name || !price) {
    return res.status(400).json({ error: 'id, name và price là bắt buộc' })
  }

  if (useMemoryStore) {
    const idx = memoryProducts.findIndex((item) => item.id === numericId)
    if (idx === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }
    memoryProducts[idx] = {
      ...memoryProducts[idx],
      name,
      price: Number(price),
      image: image || '',
      description: description || '',
    }
    return res.json(memoryProducts[idx])
  }

  try {
    await pool.query(
      'UPDATE products SET name = ?, price = ?, image = ?, description = ? WHERE id = ?',
      [name, price, image || '', description || '', numericId],
    )

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [numericId])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('PUT /api/products/:id failed', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params
  const numericId = Number(id)
  if (!numericId) {
    return res.status(400).json({ error: 'Invalid product id' })
  }

  if (useMemoryStore) {
    memoryProducts = memoryProducts.filter((item) => item.id !== numericId)
    return res.status(204).send()
  }

  try {
    await pool.query('DELETE FROM products WHERE id = ?', [numericId])
    res.status(204).send()
  } catch (error) {
    console.error('DELETE /api/products/:id failed', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`)
})
