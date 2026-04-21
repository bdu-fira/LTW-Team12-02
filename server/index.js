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

  // Tạo bảng orders
  await pool.query(`
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

  // Tạo bảng order_items
  await pool.query(`
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

  // Tạo bảng reviews
  await pool.query(`
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

  // Thêm cột deleted_at cho sản phẩm (Soft delete)
  try {
    await pool.query('ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP NULL;');
  } catch (e) { /* Bỏ qua nếu đã có */ }

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
      name: 'Apple iPhone 15 Pro',
      price: 31990000,
      image: 'https://tse1.mm.bing.net/th/id/OIP.hRrlc6TCVKg74yuM_mxbcwHaHQ?pid=Api&P=0&h=180',
      description: 'Màn hình Super Retina XDR, chip A17, camera Pro nâng tầm.',
      category: 'Điện thoại',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24 Ultra',
      price: 26990000,
      image: 'https://picsum.photos/seed/galaxys24/400/300',
      description: 'Camera 200MP, pin 5000mAh, sạc nhanh PowerShare.',
      category: 'Điện thoại',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Xiaomi Redmi Note 13 Pro',
      price: 6990000,
      image: 'https://picsum.photos/seed/redmi13pro/400/300',
      description: 'Màn hình AMOLED 120Hz, hiệu năng mạnh, giá hợp lý.',
      category: 'Điện thoại',
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'MacBook Air M2',
      price: 28990000,
      image: 'https://picsum.photos/seed/macbookair/400/300',
      description: 'Siêu mỏng nhẹ, chip M2, pin cả ngày làm việc.',
      category: 'Laptop',
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Dell XPS 13',
      price: 31900000,
      image: 'https://picsum.photos/seed/dellxps13/400/300',
      description: 'Laptop cao cấp, viền mỏng, màn hình sắc nét, bền bỉ.',
      category: 'Laptop',
      created_at: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'iPad Air 5',
      price: 13990000,
      image: 'https://picsum.photos/seed/ipadair5/400/300',
      description: 'Máy tính bảng mỏng nhẹ, hỗ trợ Apple Pencil và bàn phím.',
      category: 'Máy tính bảng',
      created_at: new Date().toISOString(),
    },
    {
      id: 7,
      name: 'Samsung Galaxy Tab S9',
      price: 15990000,
      image: 'https://picsum.photos/seed/tabs9/400/300',
      description: 'Tablet cao cấp, âm thanh AKG, pin mạnh mẽ cho đa nhiệm.',
      category: 'Máy tính bảng',
      created_at: new Date().toISOString(),
    },
    {
      id: 8,
      name: 'Smart TV QLED 65"',
      price: 21990000,
      image: 'https://tse1.mm.bing.net/th/id/OIP.hRrlc6TCVKg74yuM_mxbcwHaHQ?pid=Api&P=0&h=180',
      description: 'Hình ảnh QLED chân thực, Dolby Atmos, điều khiển thông minh.',
      category: 'TV & Âm thanh',
      created_at: new Date().toISOString(),
    },
    {
      id: 9,
      name: 'Máy giặt cửa ngang 10kg',
      price: 12990000,
      image: 'https://picsum.photos/seed/washingmachine/400/300',
      description: 'Giặt sạch tiết kiệm nước, nhiều chế độ, thiết kế hiện đại.',
      category: 'Gia dụng',
      created_at: new Date().toISOString(),
    },
    {
      id: 10,
      name: 'Robot hút bụi tự động',
      price: 4990000,
      image: 'https://picsum.photos/seed/robotvacuum/400/300',
      description: 'Dọn nhà thông minh, điều khiển app, tránh vật cản hiệu quả.',
      category: 'Thiết bị gia dụng',
      created_at: new Date().toISOString(),
    },
  ]
}

app.get('/api/products', async (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query
  
  try {
    if (useMemoryStore) {
      let filtered = [...memoryProducts]
      if (category) filtered = filtered.filter(p => p.category === category)
      if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice))
      if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice))
      return res.json(filtered.sort((a, b) => (a.id < b.id ? 1 : -1)))
    }

    let query = 'SELECT * FROM products WHERE deleted_at IS NULL'
    const params = []

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    if (minPrice) {
      query += ' AND price >= ?'
      params.push(Number(minPrice))
    }
    if (maxPrice) {
      query += ' AND price <= ?'
      params.push(Number(maxPrice))
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.query(query, params)
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

  if (useMemoryStore) {
    memoryProducts = memoryProducts.filter((item) => item.id !== numericId)
    return res.status(204).send()
  }

  try {
    // Thay đổi từ DELETE sang Soft Delete bằng cách set deleted_at
    await pool.query('UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [numericId])
    res.status(204).send()
  } catch (error) {
    console.error('DELETE /api/products/:id failed', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// ----- API CHO ĐƠN HÀNG (SCRUM-103) -----
app.post('/api/orders', async (req, res) => {
  const { user_id, customer_name, phone, address, items } = req.body
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng không được để trống' })
  }

  if (useMemoryStore) {
    return res.status(201).json({ message: 'Order simulated (memory store)' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // SCRUM-98: Tính toán tổng tiền tại Backend
    let calculatedTotal = 0
    for (const item of items) {
      // Lấy giá thực tế từ DB để tránh frontend can thiệp giá
      const [products] = await conn.query('SELECT price FROM products WHERE id = ?', [item.id])
      if (products.length > 0) {
        const itemPrice = Number(products[0].price)
        calculatedTotal += itemPrice * (item.quantity || 1)
        item.price = itemPrice // Cập nhật lại giá đúng từ DB cho item
      }
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, customer_name, phone, address, total_price) VALUES (?, ?, ?, ?, ?)',
      [user_id || null, customer_name, phone, address, calculatedTotal]
    )
    
    const orderId = orderResult.insertId

    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      )
    }

    await conn.commit()
    res.status(201).json({ 
      id: orderId, 
      total_price: calculatedTotal, 
      message: 'Đơn hàng đã được tạo và tính toán tổng tiền thành công' 
    })
  } catch (error) {
    await conn.rollback()
    console.error('POST /api/orders failed', error)
    res.status(500).json({ error: 'Failed to create order' })
  } finally {
    conn.release()
  }
})

// ----- API CHO ĐÁNH GIÁ (SCRUM-106) -----
app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params
  if (useMemoryStore) return res.json([])

  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [productId])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

app.post('/api/reviews', async (req, res) => {
  const { product_id, user_name, rating, comment } = req.body
  if (useMemoryStore) return res.status(201).json({ message: 'Review saved (memory)' })

  try {
    await pool.query(
      'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
      [product_id, user_name, rating, comment]
    )
    res.status(201).json({ message: 'Đánh giá đã được gửi' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save review' })
  }
})

// ----- API THỐNG KÊ (SCRUM-105) -----
app.get('/api/admin/stats', async (req, res) => {
  if (useMemoryStore) return res.json({ message: 'Stats not available in memory store' })

  try {
    // 1. Thống kê số lượng sản phẩm theo danh mục
    const [categoryStats] = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM products 
      WHERE deleted_at IS NULL 
      GROUP BY category 
      ORDER BY count DESC
    `)

    // 2. Thống kê doanh thu theo khách hàng
    const [revenueStats] = await pool.query(`
      SELECT customer_name, SUM(total_price) as total_spent 
      FROM orders 
      GROUP BY customer_name 
      ORDER BY total_spent DESC 
      LIMIT 10
    `)

    res.json({
      categories: categoryStats,
      topCustomers: revenueStats
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})


// ----- API PHÊ DUYỆT NGƯỜI DÙNG (SCRUM-96) -----
app.put('/api/users/:id/approve', async (req, res) => {
  const { id } = req.params
  const { approved } = req.body || {}

  if (approved === undefined) {
    return res.status(400).json({ error: 'Thiếu trường "approved" trong body' })
  }

  if (useMemoryStore) {
    return res.status(501).json({ error: 'Tính năng này yêu cầu kết nối Database thực tế' })
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET approved = ? WHERE id = ?',
      [approved === true, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' })
    }

    res.json({ message: 'Cập nhật trạng thái phê duyệt thành công' })
  } catch (error) {
    console.error('PUT /api/users/:id/approve failed', error)
    res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật' })
  }
})

// ----- API LẤY DANH SÁCH DANH MỤC -----
app.get('/api/categories', async (req, res) => {
  if (useMemoryStore) {
    const cats = [...new Set(memoryProducts.map(p => p.category))]
    return res.json(cats)
  }

  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products WHERE deleted_at IS NULL')
    res.json(rows.map(r => r.category))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`)
})
