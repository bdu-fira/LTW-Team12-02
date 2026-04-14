import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StaffPage.css'

export function StaffPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editingProduct, setEditingProduct] = useState(null)
  const [formState, setFormState] = useState({ name: '', price: '', image: '', description: '', category: 'Điện thoại' })
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
  }, [isAllowed, navigate])

  useEffect(() => {
    if (editingProduct) {
      setFormState({
        name: editingProduct.name || '',
        price: editingProduct.price || '',
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
        name: String(p.name || ''),
      })))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
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
    setFormState({ name: '', price: '', image: '', description: '', category: 'Điện thoại' })
    setFormError(null)
    setInputType('url')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    const priceNum = Number(formState.price)
    if (!formState.name.trim() || isNaN(priceNum)) {
      setFormError('Vui lòng điền thông tin hợp lệ.')
      return
    }
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `http://localhost:4000/api/products/${editingProduct.id}` : 'http://localhost:4000/api/products'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      fetchProducts()
      resetForm()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Xóa sản phẩm này?')) return
    try {
      await fetch(`http://localhost:4000/api/products/${productId}`, { method: 'DELETE' })
      fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="staffPage container" style={{ padding: '60px 0' }}>
      <header className="staffPage__header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Quản lý kho hàng</h1>
          <p style={{ color: 'var(--text-muted)' }}>Thêm mới hoặc cập nhật thông tin sản phẩm trong hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button-3d secondary" onClick={() => navigate('/')}>⬅ Trang chủ</button>
          <button className="button-3d" onClick={onLogout}>Đăng xuất</button>
        </div>
      </header>

      <section className="glass" style={{ padding: '40px', borderRadius: '32px', marginBottom: '40px', border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: '24px' }}>{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {formError && <p className="authPage__error" style={{ gridColumn: 'span 2' }}>{formError}</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Tên sản phẩm</label>
            <input className="header__search-input" name="name" value={formState.name} onChange={handleInputChange} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Giá (VNĐ)</label>
            <input className="header__search-input" name="price" value={formState.price} onChange={handleInputChange} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Danh mục</label>
            <select className="header__search-input" name="category" value={formState.category} onChange={handleInputChange}>
              <option value="Điện thoại">Điện thoại</option>
              <option value="Laptop">Laptop</option>
              <option value="TV & Âm thanh">TV & Âm thanh</option>
              <option value="Gia dụng">Gia dụng</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Ảnh sản phẩm</label>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
              <label><input type="radio" checked={inputType === 'url'} onChange={() => setInputType('url')} /> URL</label>
              <label><input type="radio" checked={inputType === 'file'} onChange={() => setInputType('file')} /> File</label>
            </div>
            {inputType === 'url' ? (
              <input className="header__search-input" name="image" value={formState.image} onChange={handleInputChange} placeholder="https://..." />
            ) : (
              <input type="file" onChange={handleFileChange} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
            <label style={{ fontWeight: '600' }}>Mô tả sản phẩm</label>
            <textarea className="header__search-input" name="description" value={formState.description} onChange={handleInputChange} rows={3} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', marginTop: '10px' }}>
            <button className="button-3d" type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button>
            {isEditing && <button className="button-3d secondary" type="button" onClick={resetForm}>Hủy bỏ</button>}
          </div>
        </form>
      </section>

      <div className="glass" style={{ padding: '30px', borderRadius: '32px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Danh sách sản phẩm</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Sản phẩm</th>
              <th style={{ padding: '15px' }}>Phân loại</th>
              <th style={{ padding: '15px' }}>Giá bán</th>
              <th style={{ padding: '15px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '15px' }}>#{p.id}</td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ padding: '15px' }}>{p.category}</td>
                <td style={{ padding: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>{p.price.toLocaleString('vi-VN')} đ</td>
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
      </div>
    </main>
  )
}
