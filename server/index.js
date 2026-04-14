import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { createPool } from './db.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

let pool

try {
  pool = createPool()

  // Ensure the products table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      image LONGTEXT DEFAULT NULL,
      description TEXT DEFAULT NULL,
      category VARCHAR(100) DEFAULT 'Khác',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await pool.query('ALTER TABLE products MODIFY image LONGTEXT;');
  } catch (error) {
    // Bỏ qua nếu bảng chưa tồn tại
  }

  try {
    await pool.query('ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT "Khác";');
  } catch (error) {
    // Bỏ qua nếu bảng chưa tồn tại
  }

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
} catch (error) {
  console.error(
    '⚠️ Could not initialize MySQL database. Data will not be loaded successfully.',
  )
<<<<<<< HEAD
  console.error(error.message)
=======
  console.warn(error.message)
  useMemoryStore = true
  memoryProducts = [
    {
      id: 1,
      name: 'Tai nghe bluetooth ANC',
      price: 1290000,
      image: 'https://picsum.photos/seed/earbuds/400/300',
      description: 'Tai nghe không dây chống ồn chủ động, pin 30h, sạc nhanh.',
      category: 'TV & Âm thanh',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Smartwatch thể thao',
      price: 1890000,
      image: 'https://picsum.photos/seed/smartwatch/400/300',
      description: 'Đo nhịp tim, theo dõi giấc ngủ, chống nước 5ATM.',
      category: 'Thiết bị gia dụng',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Loa Bluetooth di động',
      price: 990000,
      image: 'https://picsum.photos/seed/speaker/400/300',
      description: 'Âm thanh 20W, pin 15 giờ, kết nối nhanh qua NFC.',
      category: 'TV & Âm thanh',
      created_at: new Date().toISOString(),
    },
  ]
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
}

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('GET /api/products failed', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.post('/api/products', async (req, res) => {
  const { name, price, image, description, category } = req.body
  if (!name || !price) {
    return res.status(400).json({ error: 'name and price are required' })
  }

<<<<<<< HEAD
=======
  if (useMemoryStore) {
    const nextId = memoryProducts.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const product = {
      id: nextId,
      name,
      price: Number(price),
      image: image || '',
      description: description || '',
      category: category || 'Khác',
      created_at: new Date().toISOString(),
    }
    memoryProducts.unshift(product)
    return res.status(201).json(product)
  }

>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price, image, description, category) VALUES (?, ?, ?, ?, ?)',
      [name, price, image || '', description || '', category || 'Khác'],
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
  const { name, price, image, description, category } = req.body

  if (!numericId || !name || !price) {
    return res.status(400).json({ error: 'id, name và price là bắt buộc' })
  }

<<<<<<< HEAD
=======
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
      category: category || 'Khác',
    }
    return res.json(memoryProducts[idx])
  }

>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
  try {
    await pool.query(
      'UPDATE products SET name = ?, price = ?, image = ?, description = ?, category = ? WHERE id = ?',
      [name, price, image || '', description || '', category || 'Khác', numericId],
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
