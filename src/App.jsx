import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import { Cart } from './components/Cart'
import { Header } from './components/Header'
import { AuthPage } from './pages/AuthPage'
import { ProductCard } from './components/ProductCard'
import { AdminPage } from './pages/AdminPage'
import { StaffPage } from './pages/StaffPage'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [cart, setCart] = useLocalStorage('shop-cart', [])
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const cartCount = useMemo(
    () => {
      const currentCart = Array.isArray(cart) ? cart : []
      return currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    },
    [cart],
  )

  const addToCart = (product) => {
    setCart((current) => {
      const currentCart = Array.isArray(current) ? current : []
      const existing = currentCart.find((item) => item.id === product.id)
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, nextQty) => {
    setCart((current) => {
      const currentCart = Array.isArray(current) ? current : []
      return currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, nextQty) } : item,
        )
        .filter((item) => item.quantity > 0)
    })
  }

  const removeFromCart = (productId) => {
    setCart((current) => {
      const currentCart = Array.isArray(current) ? current : []
      return currentCart.filter((item) => item.id !== productId)
    })
  }

  const clearCart = () => setCart([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentUser, setCurrentUser] = useLocalStorage('shop-user', null)

  useEffect(() => {
    // Ensure admin user exists
    try {
      let users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
      if (!Array.isArray(users)) users = []
      
      if (!users.find((u) => u?.email === 'admin@shop.com')) {
        const admin = {
          email: 'admin@shop.com',
          password: 'admin',
          name: 'Quản trị viên',
          role: 'admin',
          approved: true,
        }
        window.localStorage.setItem('shop-users', JSON.stringify([...users, admin]))
      }
    } catch(e) {
      console.warn('Could not parse users', e)
    }
  }, [])

  const navigate = useNavigate()
  const location = useLocation()
  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const openLogin = () => navigate('/auth?mode=login')
  const openRegister = () => navigate('/auth?mode=register')

  const openManage = () => {
    if (currentUser?.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/staff')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    navigate('/')
  }

  const handleAuth = async ({ email, password, name, mode = 'login' }) => {
    let users = []
    try {
      users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
      if (!Array.isArray(users)) users = []
    } catch(e) {}

    if (mode === 'login') {
      const found = users.find((u) => u.email === email && u.password === password)
      if (found) {
        setCurrentUser(found)
        return found
      }

      throw new Error('Email hoặc mật khẩu không đúng.')
    }

    // register
    const exists = users.find((u) => u.email === email)
    if (exists) {
      throw new Error('Email đã được sử dụng, vui lòng đăng nhập.')
    }

    const newUser = {
      email,
      password,
      name: name || email,
      role: 'customer',
      approved: true, // Mặc định luôn là true vì tất cả đều là khách hàng
    }

    const next = [...users, newUser]
    window.localStorage.setItem('shop-users', JSON.stringify(next))

    setCurrentUser(null)
    return newUser
  }

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    setProductsError(null)

    try {
      const res = await fetch('http://localhost:4000/api/products')
      if (!res.ok) {
        throw new Error(`Lỗi khi lấy sản phẩm (${res.status})`)
      }

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
        if (!Array.isArray(data)) {
          data = []
        }
      } catch (e) {
        throw new Error('API không trả về định dạng JSON (Có thể sai URL hoặc lỗi Server).')
      }

      setProducts(
        data.map((item) => {
          const p = item || {}
          return {
            ...p,
            name: String(p.name || ''),
            price: Number(p.price) || 0,
            image: String(p.image || ''),
            description: String(p.description || ''),
            category: String(p.category || 'Khác'),
          }
        }),
      )
    } catch (err) {
      console.error(err)
      setProductsError('Không thể tải sản phẩm. Hãy kiểm tra server API và thử lại.')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    if (location.pathname === '/') {
      fetchProducts()
    }
  }, [location.pathname])

  const filteredProducts = useMemo(() => {
    const term = appliedSearchTerm.trim().toLowerCase()
    let result = products

    if (activeCategory && activeCategory !== 'Tất cả') {
      result = result.filter(p => p.category === activeCategory)
    }

    if (term) {
      result = result.filter((p) => {
        const title = String(p.name || '').toLowerCase()
        const desc = String(p.description || '').toLowerCase()
        return title.includes(term) || desc.includes(term)
      })
    }
    return result
  }, [products, appliedSearchTerm, activeCategory])

  const openAddProduct = () => {
    navigate('/staff')
  }

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      if (isCartOpen) closeCart()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isCartOpen])

  const handleUserUpdate = (email) => {
    if (!currentUser || currentUser.email !== email) return

    let users = []
    try {
      users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
      if (!Array.isArray(users)) users = []
    } catch(e) {}
    const updated = users.find((u) => u.email === email)
    if (updated) {
      setCurrentUser(updated)
    }
  }

  const handleUserDelete = (email) => {
    if (currentUser && currentUser.email === email) {
      setCurrentUser(null)
      navigate('/')
    }
  }

  return (
    <>
      <style>{`
        input:not([type="checkbox"]):not([type="radio"]), select, textarea {
          background-color: #ffffff !important;
          color: #333333 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          color-scheme: light;
        }
        input:not([type="checkbox"]):not([type="radio"]):focus, select:focus, textarea:focus {
          outline: none;
          border-color: #ffd400 !important;
          box-shadow: 0 0 0 3px rgba(255, 212, 0, 0.3);
        }
      `}</style>
      <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            <Header
              cartCount={cartCount}
              onCartClick={openCart}
              onLoginClick={openLogin}
              onRegisterClick={openRegister}
              onManageClick={openManage}
              onLogout={handleLogout}
              user={currentUser}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onSearchSubmit={() => setAppliedSearchTerm(searchTerm)}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
            />

      <section className="hero">
        <div className="hero__copy">
          <h2>Chọn hàng nhanh, giao hàng siêu tốc</h2>
          <p>
            Khám phá hàng ngàn sản phẩm công nghệ chính hãng với mức giá ưu đãi. Cam kết 100% đổi trả miễn phí, bảo hành tận nhà.
          </p>
          <div className="hero__actions">
            <button className="button" onClick={() => document.querySelector('.products')?.scrollIntoView({ behavior: 'smooth' })}>
              🛒 Mua sắm ngay
            </button>
            <button className="button button--secondary">🎁 Khám phá ưu đãi</button>
          </div>
        </div>
        <div className="hero__image" aria-hidden="true">
          <img src="https://picsum.photos/seed/electronics/900/600" alt="Sản phẩm điện tử nổi bật" />
        </div>
      </section>

      <main className="main">
        <section className="products">
          <header className="products__header">
            <div className="products__headerTop">
              <h2>Sản phẩm nổi bật</h2>
              {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
                <button className="button button--secondary" onClick={openAddProduct}>
                  Thêm sản phẩm
                </button>
              )}
            </div>
            <p>Thêm vào giỏ để được mua nhanh, giao nhanh.</p>
          </header>

          {isLoadingProducts ? (
            <div className="emptyState">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : productsError ? (
            <div className="emptyState">
              <p>{productsError}</p>
              <button className="button" onClick={fetchProducts}>
                Thử lại
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="emptyState">
              <p>Không tìm thấy sản phẩm phù hợp.</p>
              <p>Thử đổi từ khóa tìm kiếm hoặc để trống để hiển thị tất cả.</p>
            </div>
          ) : (
            <div className="productGrid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer" style={{ marginTop: 'auto', padding: '2rem 1rem', backgroundColor: '#f8f9fa', textAlign: 'center', borderTop: '1px solid #eee' }}>
        <div className="footer__container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', textAlign: 'left' }}>
          <div className="footer__col" style={{ flex: '1 1 250px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Về chúng tôi</h3>
            <p style={{ color: '#666', lineHeight: '1.5' }}>Hệ thống bán lẻ thiết bị điện tử hàng đầu với cam kết chất lượng và dịch vụ hậu mãi tốt nhất.</p>
          </div>
          <div className="footer__col" style={{ flex: '1 1 250px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Hỗ trợ khách hàng</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#666', lineHeight: '1.8' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Hotline: 1800.xxxx</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Các câu hỏi thường gặp</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Gửi yêu cầu hỗ trợ</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Hướng dẫn đặt hàng</a></li>
            </ul>
          </div>
          <div className="footer__col" style={{ flex: '1 1 250px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Chính sách</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#666', lineHeight: '1.8' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Chính sách bảo hành</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Chính sách đổi trả</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Chính sách bảo mật</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Điều khoản sử dụng</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd', color: '#999', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} React Shop. All rights reserved.
        </div>
      </footer>

      {isCartOpen && (
        <div className="cartOverlay" onClick={closeCart}>
          <div className="cartDrawer" onClick={(e) => e.stopPropagation()}>
            <header className="cartDrawer__header">
              <h2>Giỏ hàng</h2>
              <button className="cartDrawer__close" onClick={closeCart}>
                ✕
              </button>
            </header>
            <Cart
              items={Array.isArray(cart) ? cart : []}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
            />
          </div>
        </div>
      )}

            </div>
          }
        />
        <Route
          path="/auth"
          element={
            <AuthPage onAuth={handleAuth} user={currentUser} onLogout={handleLogout} />
          }
        />
        <Route
          path="/staff"
          element={<StaffPage user={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/admin"
          element={
            <AdminPage
              user={currentUser}
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </>
    )
}

export default App
