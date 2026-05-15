import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminPage.css'

export function AdminPage({ user, onUserUpdate, onUserDelete, onLogout }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'users', 'products', 'orders'

  // Stats State
  const [stats, setStats] = useState(null)

  // Users State
  const [users, setUsers] = useState([])
  const [userFilter, setUserFilter] = useState('')
  const [userSortKey, setUserSortKey] = useState('email')
  const [userSortDir, setUserSortDir] = useState('asc')
  const [editingEmail, setEditingEmail] = useState(null)
  const [editUserForm, setEditUserForm] = useState({ name: '', role: '' })

  // Products State
  const [products, setProducts] = useState([])
  const [productFilter, setProductFilter] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [editProductForm, setEditProductForm] = useState({
    name: '', brand: '', warranty: '', price: 0, old_price: '', category: '', stock_count: 0, image: '', is_flash_sale: false, description: '', specs: ''
  })
  const [showProductModal, setShowProductModal] = useState(false)

  // Orders State
  const [orders, setOrders] = useState([])
  const [orderFilter, setOrderFilter] = useState('')

  // Reviews State
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadStats()
      loadUsers()
      loadProducts()
      loadOrders()
      loadReviews()
    }
  }, [user])

  const loadStats = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/stats')
      if (res.ok) setStats(await res.json())
    } catch(e) { console.error(e) }
  }

  // ================= REVIEWS LOGIC =================
  const loadReviews = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/reviews')
      if (res.ok) setReviews(await res.json())
    } catch(e) { console.error(e) }
  }

  const updateReviewStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:4000/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      }
    } catch(e) { console.error(e) }
  }

  // ================= USERS LOGIC =================
  const loadUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users')
      if (res.ok) setUsers(await res.json())
    } catch(e) { console.error(e) }
  }

  const saveUserEdit = async (email) => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editUserForm.name, role: editUserForm.role })
      })
      if (!res.ok) throw new Error('Failed')
      const updated = await res.json()
      setUsers(prev => prev.map(u => u.email === email ? { ...u, name: updated.name, role: updated.role } : u))
      if (onUserUpdate) onUserUpdate(email)
      setEditingEmail(null)
    } catch (e) { alert('Lỗi: ' + e.message) }
  }

  const removeUser = async (email) => {
    if (!window.confirm('Xóa tài khoản này?')) return
    if (email === user?.email) return alert('Không thể xóa chính mình.')
    try {
      await fetch(`http://localhost:4000/api/users/${email}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u.email !== email))
      if (onUserDelete) onUserDelete(email)
    } catch (e) { alert('Lỗi: ' + e.message) }
  }

  const filteredUsers = useMemo(() => {
    const term = userFilter.trim().toLowerCase()
    return users.filter(u => !term || u.email.toLowerCase().includes(term) || (u.name || '').toLowerCase().includes(term))
      .sort((a, b) => {
        const dir = userSortDir === 'asc' ? 1 : -1
        return String(a[userSortKey] ?? '').toLowerCase() > String(b[userSortKey] ?? '').toLowerCase() ? dir : -dir
      })
  }, [users, userFilter, userSortKey, userSortDir])


  // ================= PRODUCTS LOGIC =================
  const loadProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/products')
      if (res.ok) setProducts(await res.json())
    } catch(e) { console.error(e) }
  }

  const openProductModal = (p = null) => {
    if (p) {
      setEditingProductId(p.id)
      setEditProductForm({
        name: p.name, brand: p.brand || '', warranty: p.warranty || '',
        price: p.price, old_price: p.old_price || '', category: p.category || '', 
        stock_count: p.stock_count || 0, image: p.image || '', is_flash_sale: !!p.is_flash_sale, 
        description: p.description || '', specs: p.specs || ''
      })
    } else {
      setEditingProductId(null)
      setEditProductForm({ name: '', brand: '', warranty: '', price: 0, old_price: '', category: '', stock_count: 0, image: '', is_flash_sale: false, description: '', specs: '' })
    }
    setShowProductModal(true)
  }

  const saveProduct = async (e) => {
    e.preventDefault()
    // Validate: tên sản phẩm không được là URL
    if (!editProductForm.name || editProductForm.name.trim().startsWith('http')) {
      alert('Tên sản phẩm không hợp lệ. Vui lòng nhập tên thực.')
      return
    }
    if (!editProductForm.price || Number(editProductForm.price) <= 0) {
      alert('Giá sản phẩm phải lớn hơn 0.')
      return
    }
    try {
      const method = editingProductId ? 'PUT' : 'POST'
      const url = `http://localhost:4000/api/products${editingProductId ? `/${editingProductId}` : ''}`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProductForm)
      })
      if (!res.ok) throw new Error('Failed')
      loadProducts()
      setShowProductModal(false)
    } catch (e) { alert('Lỗi: ' + e.message) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return
    try {
      await fetch(`http://localhost:4000/api/products/${id}`, { method: 'DELETE' })
      loadProducts()
    } catch (e) { alert('Lỗi: ' + e.message) }
  }

  const filteredProducts = useMemo(() => {
    const term = productFilter.trim().toLowerCase()
    return products.filter(p => !term || p.name.toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term))
  }, [products, productFilter])


  // ================= ORDERS LOGIC =================
  const loadOrders = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/orders')
      if (res.ok) setOrders(await res.json())
    } catch(e) { console.error(e) }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed')
      loadOrders()
    } catch (e) { alert('Lỗi: ' + e.message) }
  }

  const filteredOrders = useMemo(() => {
    const term = orderFilter.trim().toLowerCase()
    return orders.filter(o => !term || String(o.id).includes(term) || (o.customer_name || '').toLowerCase().includes(term) || (o.phone || '').includes(term))
  }, [orders, orderFilter])


  // ================= RENDER =================
  if (!user || user.role !== 'admin') {
    return (
      <main className="adminPage container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h1>Không được phép</h1>
        <p>Chỉ quản trị viên mới có thể truy cập trang này.</p>
        <button className="button-3d" style={{ marginTop: '20px' }} onClick={() => navigate('/')}>Quay lại</button>
      </main>
    )
  }

  return (
    <main className="adminPage container" style={{ padding: '40px 0' }}>
      <header className="adminPage__header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Quản trị hệ thống</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quản lý Tài khoản, Sản phẩm và Đơn hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button-3d secondary" onClick={() => navigate('/')}>⬅ Trang chủ</button>
          <button className="button-3d" onClick={onLogout}>Đăng xuất</button>
        </div>
      </header>

      <div className="adminPage__tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>
        <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Thống kê</button>
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Người dùng</button>
        <button className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🛒 Sản phẩm</button>
        <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 Đơn hàng</button>
        <button className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>💬 Đánh giá</button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'reviews' && (
        <div className="adminPage__content glass" style={{ padding: '30px', borderRadius: '32px', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '20px' }}>Quản lý Đánh giá sản phẩm</h2>
          <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '15px' }}>ID</th>
                <th style={{ padding: '15px' }}>Email</th>
                <th style={{ padding: '15px' }}>Sản phẩm</th>
                <th style={{ padding: '15px' }}>Đánh giá</th>
                <th style={{ padding: '15px' }}>Nội dung</th>
                <th style={{ padding: '15px' }}>Ngày tạo</th>
                <th style={{ padding: '15px' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px' }}>#{r.id}</td>
                  <td style={{ padding: '15px' }}>{r.user_email}</td>
                  <td style={{ padding: '15px' }}>{r.product_name}</td>
                  <td style={{ padding: '15px', minWidth: '100px' }}>{'⭐'.repeat(r.rating)}</td>
                  <td style={{ padding: '15px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.comment}</td>
                  <td style={{ padding: '15px' }}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '15px' }}>
                    <select
                      className="header__search-input"
                      style={{ padding: '6px', fontSize: '0.9rem' }}
                      value={r.status}
                      onChange={(e) => updateReviewStatus(r.id, e.target.value)}
                    >
                      <option value="pending">⏳ Chờ duyệt</option>
                      <option value="approved">✅ Đã duyệt</option>
                      <option value="rejected">❌ Từ chối</option>
                    </select>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có đánh giá nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'dashboard' && stats && (
        <div className="adminPage__content dashboard-content">
          <div className="dashboard-cards">
            <div className="dashboard-card glass">
              <div className="card-icon revenue">💰</div>
              <div className="card-info">
                <h3>Tổng doanh thu</h3>
                <p className="highlight">{Number(stats.totalRevenue).toLocaleString('vi-VN')}₫</p>
              </div>
            </div>
            <div className="dashboard-card glass">
              <div className="card-icon orders">📦</div>
              <div className="card-info">
                <h3>Tổng đơn hàng</h3>
                <p className="highlight">{stats.totalOrdersCount} đơn</p>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-panel glass">
              <h3>🏆 Sản phẩm bán chạy nhất</h3>
              <div className="dashboard-list">
                {stats.topProducts.map((p, idx) => {
                  const maxSold = Math.max(...stats.topProducts.map(x => x.total_sold), 1);
                  const percent = (p.total_sold / maxSold) * 100;
                  return (
                    <div key={idx} className="dashboard-list-item">
                      <div className="item-details">
                        <span className="item-name">{p.name}</span>
                        <span className="item-sold">{p.total_sold} đã bán</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="dashboard-panel glass">
              <h3>🏷️ Hãng/Danh mục bán chạy</h3>
              <div className="dashboard-list">
                {stats.topBrands.map((b, idx) => {
                  const maxSold = Math.max(...stats.topBrands.map(x => x.total_sold), 1);
                  const percent = (b.total_sold / maxSold) * 100;
                  return (
                    <div key={idx} className="dashboard-list-item">
                      <div className="item-details">
                        <span className="item-name">{b.category}</span>
                        <span className="item-sold">{b.total_sold} đã bán</span>
                      </div>
                      <div className="progress-bar-bg brand-color">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <div className="adminPage__content">
          <div className="adminPage__toolbar" style={{ marginBottom: '20px' }}>
            <input className="header__search-input" style={{ maxWidth: '400px' }} placeholder="Tìm theo email hoặc tên..." value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
          </div>
          <div className="adminPage__tableWrapper glass" style={{ borderRadius: '16px', padding: '20px', overflowX: 'auto', border: '1px solid var(--border)' }}>
            <table className="adminPage__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '15px' }}>Email</th>
                  <th style={{ padding: '15px' }}>Họ tên</th>
                  <th style={{ padding: '15px' }}>Vai trò</th>
                  <th style={{ padding: '15px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isEditing = editingEmail === u.email
                  return (
                    <tr key={u.email} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '15px' }}>{u.email}</td>
                      <td style={{ padding: '15px' }}>
                        {isEditing ? <input className="header__search-input" style={{ padding: '6px 12px' }} value={editUserForm.name} onChange={(e) => setEditUserForm(p => ({ ...p, name: e.target.value }))} /> : (u.name || '---')}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {isEditing ? (
                          <select className="header__search-input" style={{ padding: '6px 12px' }} value={editUserForm.role} onChange={(e) => setEditUserForm(p => ({ ...p, role: e.target.value }))}>
                            <option value="user">Khách hàng</option>
                            <option value="admin">Quản trị</option>
                          </select>
                        ) : (
                          <span className={`role-badge role-${u.role}`}>{u.role === 'admin' ? 'Quản trị' : 'Khách hàng'}</span>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {isEditing ? (
                            <>
                              <button className="button-3d" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => saveUserEdit(u.email)}>Lưu</button>
                              <button className="button-3d secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setEditingEmail(null)}>Hủy</button>
                            </>
                          ) : (
                            <>
                              <button className="button-3d secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setEditingEmail(u.email); setEditUserForm({ name: u.name, role: u.role }) }}>Sửa</button>
                              <button className="button-3d secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => removeUser(u.email)}>Xóa</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="adminPage__content">
          <div className="adminPage__toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
            <input className="header__search-input" style={{ maxWidth: '400px' }} placeholder="Tìm sản phẩm..." value={productFilter} onChange={(e) => setProductFilter(e.target.value)} />
            <button className="button-3d" onClick={() => openProductModal(null)}>+ Thêm sản phẩm</button>
          </div>
          <div className="adminPage__tableWrapper glass" style={{ borderRadius: '16px', padding: '20px', overflowX: 'auto', border: '1px solid var(--border)' }}>
            <table className="adminPage__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '15px' }}>Ảnh</th>
                  <th style={{ padding: '15px' }}>Tên sản phẩm</th>
                  <th style={{ padding: '15px' }}>Danh mục</th>
                  <th style={{ padding: '15px' }}>Giá</th>
                  <th style={{ padding: '15px' }}>Kho</th>
                  <th style={{ padding: '15px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px' }}>
                      {p.image ? (
                        <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} onError={e => { e.target.style.display='none' }}/>
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🖼️</div>
                      )}
                    </td>
                    <td style={{ padding: '15px', maxWidth: '250px' }}>{p.name}</td>
                    <td style={{ padding: '15px' }}>{p.category}</td>
                    <td style={{ padding: '15px' }}>{Number(p.price).toLocaleString('vi-VN')}₫</td>
                    <td style={{ padding: '15px' }}>{p.stock_count}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="button-3d secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openProductModal(p)}>Sửa</button>
                        <button className="button-3d secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => deleteProduct(p.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="adminPage__content">
          <div className="adminPage__toolbar" style={{ marginBottom: '20px' }}>
            <input className="header__search-input" style={{ maxWidth: '400px' }} placeholder="Tìm theo mã đơn, tên, sđt..." value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} />
          </div>
          <div className="adminPage__tableWrapper glass" style={{ borderRadius: '16px', padding: '20px', overflowX: 'auto', border: '1px solid var(--border)' }}>
            <table className="adminPage__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '15px' }}>Mã đơn</th>
                  <th style={{ padding: '15px' }}>Khách hàng</th>
                  <th style={{ padding: '15px' }}>SĐT / Email</th>
                  <th style={{ padding: '15px' }}>Tổng tiền</th>
                  <th style={{ padding: '15px' }}>Ngày đặt</th>
                  <th style={{ padding: '15px' }}>Trạng thái</th>
                  <th style={{ padding: '15px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>#{o.id}</td>
                    <td style={{ padding: '15px' }}>{o.customer_name}</td>
                    <td style={{ padding: '15px' }}>{o.phone}<br/><small>{o.user_email}</small></td>
                    <td style={{ padding: '15px', color: 'var(--danger)', fontWeight: 'bold' }}>{Number(o.total).toLocaleString('vi-VN')}₫</td>
                    <td style={{ padding: '15px' }}>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '15px' }}>
                      <span className={`status-badge status-${o.status}`}>
                        {o.status === 'pending' ? '⏳ Đang xử lý' : o.status === 'completed' ? '✅ Đã giao' : '❌ Đã hủy'}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <select className="header__search-input" style={{ padding: '6px 12px', width: '130px' }} value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                        <option value="pending">Chờ xử lý</option>
                        <option value="completed">Đã giao (Xong)</option>
                        <option value="cancelled">Hủy đơn</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL SẢN PHẨM */}
      {showProductModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass">
            <h2>{editingProductId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={saveProduct} className="admin-form">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input type="text" required value={editProductForm.name} onChange={e => setEditProductForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Hãng sản xuất</label>
                  <input type="text" placeholder="VD: Apple, Samsung..." value={editProductForm.brand} onChange={e => setEditProductForm(p => ({...p, brand: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Bảo hành</label>
                  <input type="text" placeholder="VD: 12 tháng, 2 năm..." value={editProductForm.warranty} onChange={e => setEditProductForm(p => ({...p, warranty: e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giá bán (VNĐ) *</label>
                  <input type="number" required value={editProductForm.price} onChange={e => setEditProductForm(p => ({...p, price: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Giá cũ (VNĐ)</label>
                  <input type="number" value={editProductForm.old_price} onChange={e => setEditProductForm(p => ({...p, old_price: e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục</label>
                  <select value={editProductForm.category} onChange={e => setEditProductForm(p => ({...p, category: e.target.value}))}>
                    <option value="">Chọn danh mục</option>
                    <option value="Điện thoại">Điện thoại</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Máy tính bảng">Máy tính bảng</option>
                    <option value="TV & Âm thanh">TV & Âm thanh</option>
                    <option value="Gia dụng">Gia dụng</option>
                    <option value="Thiết bị gia dụng">Thiết bị gia dụng</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tồn kho</label>
                  <input type="number" value={editProductForm.stock_count} onChange={e => setEditProductForm(p => ({...p, stock_count: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label>Hình ảnh sản phẩm</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ padding: '8px', border: '1px dashed var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditProductForm(p => ({ ...p, image: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hoặc dán URL:</span>
                    <input 
                      style={{ flex: 1 }}
                      placeholder="https://example.com/image.jpg"
                      value={editProductForm.image && !editProductForm.image.startsWith('data:') ? editProductForm.image : ''} 
                      onChange={e => setEditProductForm(p => ({...p, image: e.target.value}))} 
                    />
                  </div>
                  {editProductForm.image && (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Xem trước:</p>
                      <img src={editProductForm.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả ngắn sản phẩm</label>
                <textarea 
                  rows={3} 
                  placeholder="Nhập mô tả tóm tắt về sản phẩm..."
                  value={editProductForm.description} 
                  onChange={e => setEditProductForm(p => ({...p, description: e.target.value}))} 
                />
              </div>
              <div className="form-group">
                <label>Thông số kỹ thuật chi tiết</label>
                <textarea 
                  rows={5} 
                  placeholder="VD:
- Vi xử lý: Apple A17 Pro
- RAM: 8GB
- Màn hình: 6.1 inch OLED..."
                  value={editProductForm.specs} 
                  onChange={e => setEditProductForm(p => ({...p, specs: e.target.value}))} 
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="flashsale" checked={editProductForm.is_flash_sale} onChange={e => setEditProductForm(p => ({...p, is_flash_sale: e.target.checked}))} />
                <label htmlFor="flashsale" style={{ margin: 0 }}>Đưa vào Flash Sale</label>
              </div>
              <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="button-3d secondary" onClick={() => setShowProductModal(false)}>Hủy</button>
                <button type="submit" className="button-3d">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
