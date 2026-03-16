import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StaffPage.css'

export function StaffPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)

  const isAllowed = useMemo(() => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.role === 'staff' && user.approved
  }, [user])

  useEffect(() => {
    if (!isAllowed) {
      navigate('/')
      return
    }

    fetchProducts()
  }, [isAllowed])

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/products')
      if (!res.ok) {
        throw new Error('Không thể tải sản phẩm')
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
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => setEditingProduct(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = formData.get('name')?.toString().trim()
    const rawPrice = formData.get('price')?.toString().trim() || ''
    const price = Number(rawPrice.replace(/[^0-9.]/g, ''))
    const image = formData.get('image')?.toString().trim()
    const description = formData.get('description')?.toString().trim()

    if (!name || rawPrice === '' || Number.isNaN(price)) {
      alert('Tên và giá là bắt buộc. Giá phải là số hợp lệ.')
      return
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, image, description }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || 'Không thể lưu sản phẩm')
      }

      await fetchProducts()
      resetForm()
      form.reset()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')) return

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || 'Không thể xóa sản phẩm')
      }
      await fetchProducts()
    } catch (err) {
      alert(err.message)
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
              : 'Bạn có thể thêm/sửa/xóa sản phẩm khi tài khoản đã được duyệt.'}
          </p>
        </div>
        <button className="button button--secondary" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      <section className="staffPage__formSection">
        <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
        <form className="staffPage__form" onSubmit={handleSubmit}>
          <label>
            Tên sản phẩm
            <input name="name" defaultValue={editingProduct?.name || ''} required />
          </label>
          <label>
            Giá (VNĐ)
            <input
              name="price"
              type="number"
              min="0"
              step="1000"
              defaultValue={editingProduct?.price || ''}
              required
            />
          </label>
          <label>
            Ảnh (URL)
            <input name="image" defaultValue={editingProduct?.image || ''} />
          </label>
          <label>
            Mô tả
            <textarea name="description" defaultValue={editingProduct?.description || ''} rows={3} />
          </label>

          <div className="staffPage__formActions">
            <button className="button" type="submit">
              {editingProduct ? 'Cập nhật' : 'Thêm'}
            </button>
            {editingProduct && (
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
          <table className="staffPage__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Hình</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
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
        )}
      </section>
    </main>
  )
}
