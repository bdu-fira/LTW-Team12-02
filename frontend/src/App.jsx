import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import { Cart } from './components/Cart'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { FlashSale } from './components/FlashSale'
import { Footer } from './components/Footer'
import { AuthPage } from './pages/AuthPage'
import { ProductCard } from './components/ProductCard'
import { AdminPage } from './pages/AdminPage'
import { StaffPage } from './pages/StaffPage'
import { Reviews } from './components/Reviews'
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
  const [reviewProduct, setReviewProduct] = useState(null)

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
      approved: true,
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

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <FlashSale />
              <main className="main container">
                <section className="products">
                  <header className="products__header" style={{ marginBottom: '40px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                      <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Sản phẩm nổi bật</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Khám phá các thiết bị công nghệ mới nhất hiện nay.</p>
                      </div>
                      {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
                        <button className="button-3d" onClick={openAddProduct}>
                          + Thêm sản phẩm
                        </button>
                      )}
                    </div>
                  </header>

                  {isLoadingProducts ? (
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                      <p>Đang tải sản phẩm...</p>
                    </div>
                  ) : productsError ? (
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                      <p>{productsError}</p>
                      <button className="button-3d" style={{ marginTop: '16px' }} onClick={fetchProducts}>
                        Thử lại
                      </button>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                      <p>Không tìm thấy sản phẩm phù hợp.</p>
                    </div>
                  ) : (
                    <div className="productGrid">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAdd={addToCart}
                          onShowReviews={(p) => setReviewProduct(p)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </main>
            </>
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

      <Footer />

      {isCartOpen && (
        <div className="cartOverlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'flex-end'
        }} onClick={closeCart}>
          <div className="cartDrawer glass" style={{
            width: '100%',
            maxWidth: '450px',
            height: '100%',
            padding: '30px',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <Cart
              items={Array.isArray(cart) ? cart : []}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
              user={currentUser}
            />
          </div>
        </div>
      )}

      {reviewProduct && (
        <Reviews 
          productId={reviewProduct.id} 
          productName={reviewProduct.name}
          onClose={() => setReviewProduct(null)}
          user={currentUser}
        />
      )}
    </div>
  )
}

export default App
