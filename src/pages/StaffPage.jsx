import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StaffPage.css'

export function StaffPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for the form (controlled components)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formState, setFormState] = useState({ name: '', price: '', image: '', description: '', category: 'Điện thoại' })
  const [formError, setFormError] = useState(null)
  const [inputType, setInputType] = useState('url')

  // Derived state to check if we are in "edit mode"
  const isEditing = useMemo(() => Boolean(editingProduct), [editingProduct])

  // Check user permissions
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

  // When editingProduct changes, update the form state
  useEffect(() => {
    if (editingProduct) {
      setFormState({
        name: editingProduct.name || '',
        price: editingProduct.price || '',
        image: editingProduct.image || '',
        description: editingProduct.description || '',
        category: editingProduct.category || 'Điện thoại',
      })

      if (editingProduct.image && editingProduct.image.startsWith('data:image')) {
        setInputType('file')
      } else {
        setInputType('url')
      }
    }
  }, [editingProduct])

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:4000/api/products')
      if (!res.ok) {
        throw new Error('Không thể tải sản phẩm')
      }

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
        if (!Array.isArray(data)) {
          throw new Error('Dữ liệu trả về không phải là danh sách.')
        }
      } catch (e) {
        throw new Error('Server trả về dữ liệu lỗi (HTML thay vì JSON).')
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
      reader.onloadend = () => {
        setFormState((prev) => ({ ...prev, image: reader.result }))
      }
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

    const { name, price, image, description, category } = formState
    const priceNum = Number(price)

    if (!name.trim() || String(price).trim() === '' || Number.isNaN(priceNum)) {
      setFormError('Tên và giá là bắt buộc. Giá phải là một con số hợp lệ.')
      return
    }

    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `http://localhost:4000/api/products/${editingProduct.id}` : 'http://localhost:4000/api/products'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, image, description, category }),
      })

      if (!res.ok) {
        const text = await res.text()
        let errorMessage = 'Không thể lưu sản phẩm'
        try {
          const err = JSON.parse(text)
          errorMessage = err?.error || errorMessage
        } catch (e) {}
        throw new Error(errorMessage)
      }

      await fetchProducts()
      resetForm()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    // Scroll to the form for better UX
    document.querySelector('.staffPage__formSection')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')) return

    try {
      const res = await fetch(`http://localhost:4000/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text()
        let errorMessage = 'Không thể xóa sản phẩm'
        try {
          const err = JSON.parse(text)
          errorMessage = err?.error || errorMessage
        } catch (e) {}
        throw new Error(errorMessage)
      }
      await fetchProducts()
    } catch (err) {
      setError(err.message) // Use page-level error state for delete errors
    }
  }

  return (
    <main className="staffPage">
      <div className="staffPage__header">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>
            {user?.role === 'admin'
              ? 'Bạn đang sử dụng quyền quản trị. Bạn có thể thêm/sửa/xóa sản phẩm.'
              : 'Bạn có thể quản lý, thêm, sửa, xóa các sản phẩm trên hệ thống.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="button" onClick={() => navigate('/')}>
            Trang chủ
          </button>
          <button className="button button--secondary" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <section className="staffPage__formSection">
        <h2>{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
        <form className="staffPage__form" onSubmit={handleSubmit}>
          {formError && <p className="staffPage__error staffPage__error--form">{formError}</p>}

          <label>
            Tên sản phẩm
            <input name="name" value={formState.name} onChange={handleInputChange} required />
          </label>
          <label>
            Giá (VNĐ)
            <input
              name="price"
              type="text" // Use text to allow for easier formatting/input, validation is done on submit
              inputMode="numeric"
              pattern="[0-9]*"
              min="0"
              value={formState.price}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Danh mục
            <select name="category" value={formState.category} onChange={handleInputChange}>
              <option value="Điện thoại">Điện thoại</option>
              <option value="Laptop">Laptop</option>
              <option value="Máy tính bảng">Máy tính bảng</option>
              <option value="TV & Âm thanh">TV & Âm thanh</option>
              <option value="Gia dụng">Gia dụng</option>
              <option value="Thiết bị gia dụng">Thiết bị gia dụng</option>
              <option value="Khác">Khác</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Ảnh sản phẩm
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', marginTop: '4px' }}>
              <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="radio" checked={inputType === 'url'} onChange={() => setInputType('url')} />
                Dùng URL
              </label>
              <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="radio" checked={inputType === 'file'} onChange={() => setInputType('file')} />
                Tải file lên
              </label>
            </div>
            {inputType === 'url' ? (
              <input name="image" value={formState.image} onChange={handleInputChange} placeholder="https://..." />
            ) : (
              <input type="file" accept="image/*" onChange={handleFileChange} />
            )}
            {formState.image && inputType === 'file' && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>Bản xem trước:</p>
                <img src={formState.image} alt="Preview" style={{ height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
            )}
          </label>
          <label>
            Mô tả
            <textarea
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              rows={3}
            />
          </label>

          <div className="staffPage__formActions">
            <button className="button" type="submit">
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </button>
            {isEditing && (
              <button type="button" className="button button--secondary" onClick={resetForm}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="staffPage__list">
        <h2>Danh sách sản phẩm</h2>
        {isLoading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="staffPage__error">{error}</p>
        ) : (
          <div className="staffPage__tableWrapper" style={{ overflowX: 'auto' }}>
          <table className="staffPage__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Hình</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td style={{ fontWeight: '500' }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {product.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </td>
                  <td>
                    {product.image ? (
                      <img className="staffPage__thumb" src={product.image} alt={product.name} />
                    ) : (
                      <span>–</span>
                    )}
                  </td>
                  <td className="staffPage__actions">
                    <button className="button" type="button" onClick={() => handleEdit(product)}>
                      Sửa
                    </button>
                    <button className="button button--danger" type="button" onClick={() => handleDelete(product.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </main>
  )
}
