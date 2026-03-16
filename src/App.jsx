import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import { AddProductModal } from './components/AddProductModal'
import { Cart } from './components/Cart'
import { Header } from './components/Header'
import { ProductCard } from './components/ProductCard'
import { AuthPage } from './pages/AuthPage'
import { AdminPage } from './pages/AdminPage'
import { StaffPage } from './pages/StaffPage'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [cart, setCart] = useLocalStorage('shop-cart', [])
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, nextQty) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, nextQty) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId))
  }

  const clearCart = () => setCart([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentUser, setCurrentUser] = useLocalStorage('shop-user', null)

  useEffect(() => {
    // Ensure admin user exists
    const users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
    if (!users.find((u) => u.email === 'admin@shop.com')) {
      const admin = {
        email: 'admin@shop.com',
        password: 'admin',
        name: 'Quản trị viên',
        role: 'admin',
        approved: true,
      }
      window.localStorage.setItem('shop-users', JSON.stringify([...users, admin]))
    }
  }, [])

  const navigate = useNavigate()
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

  const handleAuth = async ({ email, password, name, role = 'customer', mode = 'login' }) => {
    const users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')

    if (mode === 'login') {
      const found = users.find((u) => u.email === email && u.password === password)
      if (found) {
        if (found.role === 'staff' && !found.approved) {
          throw new Error('Tài khoản nhân viên đang chờ duyệt. Vui lòng đợi.')
        }
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
      role: role === 'staff' ? 'staff' : 'customer',
      approved: role === 'staff' ? false : true,
    }

    const next = [...users, newUser]
    window.localStorage.setItem('shop-users', JSON.stringify(next))

    // Persist a pending staff flag so the UI can show "đang chờ duyệt" even after refresh
    if (newUser.role === 'staff' && !newUser.approved) {
      window.localStorage.setItem('shop-pending-staff', newUser.email)
    }

    if (newUser.approved) {
      setCurrentUser(newUser)
      return newUser
    }

    setCurrentUser(null)
    return newUser
  }

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    setProductsError(null)

    try {
      const res = await fetch('/api/products')
      if (!res.ok) {
        throw new Error(`Lỗi khi lấy sản phẩm (${res.status})`)
      }
      const data = await res.json()

      setProducts(
        data.map((item) => ({
          ...item,
          price: Number(item.price) || 0,
          image: item.image || '',
          description: item.description || '',
        })),
      )
    } catch (err) {
      console.error(err)
      setProductsError('Không thể tải sản phẩm. Hãy kiểm tra server API và thử lại.')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const term = appliedSearchTerm.trim().toLowerCase()
    if (!term) return products

    return products.filter((p) => {
      const title = (p.name || '').toLowerCase()
      const desc = (p.description || '').toLowerCase()
      return title.includes(term) || desc.includes(term)
    })
  }, [products, appliedSearchTerm])

  const openAddProduct = () => {
    if (currentUser?.role === 'admin') {
      navigate('/admin')
      return
    }
    if (currentUser?.role === 'staff' && currentUser.approved) {
      navigate('/staff')
      return
    }

    setIsAddProductOpen(true)
  }
  const closeAddProduct = () => setIsAddProductOpen(false)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      if (isCartOpen) closeCart()
      if (isAddProductOpen) closeAddProduct()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isCartOpen, isAddProductOpen])

  const handleAddProduct = async ({ name, price, image, description }) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: Number(price), image, description }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || 'Không thể thêm sản phẩm')
      }

      const newProduct = await res.json()
      setProducts((current) => [
        {
          ...newProduct,
          price: Number(newProduct.price) || 0,
          image: newProduct.image || '',
          description: newProduct.description || '',
        },
        ...current,
      ])
      closeAddProduct()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) {
        const err = await res.json()
        throw new Error(err?.error || 'Không thể xóa sản phẩm')
      }

      setProducts((current) => current.filter((item) => item.id !== productId))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleStaffApproved = (email) => {
    if (currentUser && currentUser.email === email) {
      const updated = { ...currentUser, approved: true }
      setCurrentUser(updated)
      navigate('/staff')
    }

    const pending = window.localStorage.getItem('shop-pending-staff')
    if (pending === email) {
      window.localStorage.removeItem('shop-pending-staff')
    }
  }

  const handleUserUpdate = (email) => {
    if (!currentUser || currentUser.email !== email) return

    const users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
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
            />

      <section className="hero">
        <div className="hero__copy">
          <h2>Chọn hàng nhanh, giao hàng siêu tốc</h2>
          <p>
            Mua sắm điện tử & gia dụng - giao ngay, đổi trả dễ dàng.
          </p>
          <div className="hero__actions">
            <button className="button">Xem khuyến mãi</button>
            <button className="button button--secondary">Xem tất cả</button>
          </div>
        </div>
        <div className="hero__image" aria-hidden="true">
          <div className="hero__imageBg" />
          <div className="hero__imageLayer" />
        </div>
      </section>

      <main className="main">
        <section className="products">
          <header className="products__header">
            <div className="products__headerTop">
              <h2>Sản phẩm nổi bật</h2>
              {(currentUser?.role === 'admin' || (currentUser?.role === 'staff' && currentUser?.approved)) && (
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
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </section>
      </main>

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
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
            />
          </div>
        </div>
      )}

      {isAddProductOpen && (
        <AddProductModal onClose={closeAddProduct} onAdd={handleAddProduct} />
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
              onApprove={handleStaffApproved}
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    )
}

export default App
