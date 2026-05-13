import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StaffPage.css'

export function StaffPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('products') // 'products', 'orders'
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Product Form State
  const [editingProduct, setEditingProduct] = useState(null)
  const [formState, setFormState] = useState({ name: '', price: '', old_price: '', is_flash_sale: false, sold_count: '', stock_count: '', image: '', description: '', category: 'Điện thoại' })
  const [formError, setFormError] = useState(null)
  const [inputType, setInputType] = useState('url')

  const isEditing = useMemo(() => Boolean(editingProduct), [editingProduct])

  const isAllowed = useMemo(() => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.role === 'staff'
  }, [user])

  useEffect(() => {
    if (!isAllowed) {
      navigate('/')
      return
    }
    fetchProducts()
    fetchOrders()
  }, [isAllowed, navigate])

  useEffect(() => {
    if (editingProduct) {
      setFormState({
        name: editingProduct.name || '',
        price: editingProduct.price || '',
        old_price: editingProduct.old_price || '',
        is_flash_sale: Boolean(editingProduct.is_flash_sale),
        sold_count: editingProduct.sold_count || '0',
        stock_count: editingProduct.stock_count || '0',
        image: editingProduct.image || '',
        description: editingProduct.description || '',
        category: editingProduct.category || 'Điện thoại',
      })
      setInputType(editingProduct.image?.startsWith('data:image') ? 'file' : 'url')
    }
  }, [editingProduct])

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:4000/api/products')
      if (!res.ok) throw new Error('Không thể tải sản phẩm')
      const data = await res.json()
      setProducts(data.map(p => ({
        ...p,
        price: Number(p.price) || 0,
        old_price: Number(p.old_price) || 0,
        is_flash_sale: Boolean(p.is_flash_sale),
        sold_count: Number(p.sold_count) || 0,
        stock_count: Number(p.stock_count) || 0,
      })))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/orders')
      if (res.ok) setOrders(await res.json())
    } catch (e) { console.error('Lỗi khi tải đơn hàng:', e) }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Lỗi khi cập nhật trạng thái')
      alert('Đã cập nhật trạng thái đơn hàng thành công!')
      fetchOrders()
    } catch (e) { alert('Lỗi: ' + e.message) }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormState((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setFormState((prev) => ({ ...prev, image: reader.result }))
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormState({ name: '', price: '', old_price: '', is_flash_sale: false, sold_count: '', stock_count: '', image: '', description: '', category: 'Điện thoại' })
    setFormError(null)
    setInputType('url')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    
    const priceNum = Number(formState.price)
    if (!formState.name.trim() || isNaN(priceNum)) {
      setFormError('Vui lòng điền thông tin hợp lệ (Tên và Giá là bắt buộc).')
      return
    }

    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `http://localhost:4000/api/products/${editingProduct.id}` : 'http://localhost:4000/api/products'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })

      if (!res.ok) {
        const text = await res.text()
        let errMsg = 'Không thể lưu sản phẩm'
        try {
          const errData = JSON.parse(text)
          errMsg = errData.error || errMsg
        } catch(e) {}
        throw new Error(errMsg)
      }

      fetchProducts()
      resetForm()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return
    
    setIsLoading(true)
    setError(null)
    setFormError(null)
    
    try {
      const res = await fetch(`http://localhost:4000/api/products/${productId}`, { 
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      })
      
      if (!res.ok) {
        const text = await res.text()
        let errMsg = 'Không thể xóa sản phẩm'
        try {
          const errData = JSON.parse(text)
          errMsg = errData.error || errMsg
        } catch(e) {}
        throw new Error(errMsg)
      }
      
      alert('Đã xóa sản phẩm thành công!')
      await fetchProducts()
    } catch (err) {
      setError(err.message)
      alert(`Lỗi: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="staffPage container" style={{ padding: '60px 0' }}>
      <header className="staffPage__header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Quản lý kho hàng</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Chào mừng, {user?.name || 'Nhân viên'}. Bạn đang quản lý các hoạt động tại cửa hàng.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button-3d secondary" onClick={() => navigate('/')}>⬅ Trang chủ</button>
          <button className="button-3d" onClick={onLogout}>Đăng xuất</button>
        </div>
      </header>

      <div className="staffPage__tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>
        <button className={`staff-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🛒 Sản phẩm</button>
        <button className={`staff-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 Đơn hàng</button>
      </div>

      {activeTab === 'products' ? (
        <>
          <section className="glass" style={{ padding: '40px', borderRadius: '32px', marginBottom: '40px', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '24px' }}>{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {formError && <p className="authPage__error" style={{ gridColumn: 'span 2' }}>{formError}</p>}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600' }}>Tên sản phẩm</label>
                <input className="header__search-input" name="name" value={formState.name} onChange={handleInputChange} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600' }}>Giá khuyến mãi (VNĐ)</label>
                <input className="header__search-input" name="price" value={formState.price} onChange={handleInputChange} type="number" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600' }}>Giá gốc (VNĐ)</label>
                <input className="header__search-input" name="old_price" value={formState.old_price} onChange={handleInputChange} type="number" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="is_flash_sale" name="is_flash_sale" checked={formState.is_flash_sale} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} />
                <label htmlFor="is_flash_sale" style={{ fontWeight: '600' }}>Sản phẩm Flash Sale</label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600' }}>Danh mục</label>
                <select className="header__search-input" name="category" value={formState.category} onChange={handleInputChange}>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Máy tính bảng">Máy tính bảng</option>
                  <option value="TV & Âm thanh">TV & Âm thanh</option>
                  <option value="Gia dụng">Gia dụng</option>
                  <option value="Thiết bị gia dụng">Thiết bị gia dụng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600' }}>Ảnh sản phẩm</label>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
                  <label style={{ cursor: 'pointer' }}><input type="radio" checked={inputType === 'url'} onChange={() => setInputType('url')} /> URL</label>
                  <label style={{ cursor: 'pointer' }}><input type="radio" checked={inputType === 'file'} onChange={() => setInputType('file')} /> File</label>
                </div>
                {inputType === 'url' ? (
                  <input className="header__search-input" name="image" value={formState.image} onChange={handleInputChange} placeholder="https://..." />
                ) : (
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '600' }}>Mô tả sản phẩm</label>
                <textarea className="header__search-input" name="description" value={formState.description} onChange={handleInputChange} rows={3} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px' }}>
                <button className="button-3d" type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button>
                {isEditing && <button className="button-3d secondary" type="button" onClick={resetForm}>Hủy bỏ</button>}
              </div>
            </form>
          </section>

          <div className="glass" style={{ padding: '30px', borderRadius: '32px', border: '1px solid var(--border)', overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Danh sách sản phẩm</h2>
            {isLoading ? <p>Đang tải...</p> : error ? <p className="authPage__error">{error}</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '15px' }}>Ảnh</th>
                    <th style={{ padding: '15px' }}>Tên sản phẩm</th>
                    <th style={{ padding: '15px' }}>Giá</th>
                    <th style={{ padding: '15px' }}>Kho</th>
                    <th style={{ padding: '15px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '15px' }}>
                        {p.image ? <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /> : '---'}
                      </td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.name}</td>
                      <td style={{ padding: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>{p.price.toLocaleString('vi-VN')} đ</td>
                      <td style={{ padding: '15px' }}>{p.stock_count}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="button-3d secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => setEditingProduct(p)}>Sửa</button>
                          <button className="button-3d secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => handleDelete(p.id)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="glass" style={{ padding: '30px', borderRadius: '32px', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '20px' }}>Quản lý Đơn hàng</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '15px' }}>Mã đơn</th>
                <th style={{ padding: '15px' }}>Khách hàng</th>
                <th style={{ padding: '15px' }}>Tổng tiền</th>
                <th style={{ padding: '15px' }}>Trạng thái</th>
                <th style={{ padding: '15px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>#{o.id}</td>
                  <td style={{ padding: '15px' }}>{o.customer_name}<br/><small>{o.phone}</small></td>
                  <td style={{ padding: '15px', color: 'var(--danger)', fontWeight: 'bold' }}>{Number(o.total).toLocaleString('vi-VN')}₫</td>
                  <td style={{ padding: '15px' }}>
                    <span className={`status-badge status-${o.status}`}>
                      {o.status === 'pending' ? '⏳ Đang xử lý' : o.status === 'completed' ? '✅ Đã giao' : '❌ Đã hủy'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <select className="header__search-input" style={{ padding: '6px 12px', width: '130px' }} value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                      <option value="pending">Chờ xử lý</option>
                      <option value="completed">Đã giao</option>
                      <option value="cancelled">Hủy đơn</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
