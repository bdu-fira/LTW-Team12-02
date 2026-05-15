import { useState } from 'react'
import './Cart.css'

export function Cart({ user, items, onUpdateQuantity, onRemove, onClear }) {
  const [isCheckout, setIsCheckout] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: '',
    phone: '',
    notes: '',
    paymentMethod: 'cash'
  })
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  const handleCheckoutClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện đặt hàng!');
      return;
    }
    setIsCheckout(true)
  }
  const handleBackToCart = () => setIsCheckout(false)
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setIsSubmitting(true)

    try {
      const orderPayload = {
        user_email: user?.email || 'guest@shop.com',
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        total: total,
        payment_method: formData.paymentMethod,
        items: items
      }

      const res = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      if (!res.ok) throw new Error('Failed to place order')

      setOrderSuccess(true)
      setTimeout(() => {
        onClear()
        setOrderSuccess(false)
        setIsCheckout(false)
      }, 3000)
    } catch (err) {
      alert('Có lỗi xảy ra khi đặt hàng: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <aside className="cart">
        <div className="cart__empty" style={{ margin: 'auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ marginBottom: '8px' }}>Đặt hàng thành công!</h2>
          <p>Cảm ơn bạn đã mua hàng.</p>
          <small>Giỏ hàng sẽ tự động đóng sau vài giây...</small>
        </div>
      </aside>
    )
  }

  if (isCheckout) {
    return (
      <aside className="cart">
        <header className="cart__header" style={{ justifyContent: 'flex-start' }}>
          <button className="cart__button" onClick={handleBackToCart} style={{ marginRight: '8px' }}>←</button>
          <h2>Thanh toán</h2>
        </header>

        <form className="cart__checkout-form" onSubmit={handleSubmitOrder}>
          <div className="form-group">
            <label>Họ và tên *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Nhập họ và tên..." />
          </div>
          
          <div className="form-group">
            <label>Số điện thoại *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Nhập số điện thoại..." />
          </div>

          <div className="form-group">
            <label>Địa chỉ giao hàng *</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} required placeholder="Nhập địa chỉ chi tiết..."></textarea>
          </div>

          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
              <option value="cash">Thanh toán tiền mặt khi nhận hàng (COD)</option>
              <option value="transfer">Chuyển khoản ngân hàng</option>
            </select>
            {formData.paymentMethod === 'transfer' && (
              <div className="transfer-info" style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', textAlign: 'center' }}>
                <p style={{ marginBottom: '12px' }}><strong>Quét mã QR để thanh toán:</strong></p>
                <img 
                  src="/payment_qr.png" 
                  alt="Mã QR thanh toán" 
                  style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                />
                <div style={{ textAlign: 'left', background: 'var(--card-bg)', padding: '12px', borderRadius: '8px' }}>
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>STK:</strong> 0123456789</p>
                  <p><strong>Chủ TK:</strong> SHOP ELECTRONICS</p>
                  <p><strong>Nội dung:</strong> GD_Xanh_{Math.floor(1000 + Math.random() * 9000)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Ghi chú thêm cho đơn hàng..."></textarea>
          </div>

          <div className="cart__footer" style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <div className="cart__total">
              <span>Tổng thanh toán</span>
              <span className="cart__totalValue">
                {total.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </span>
            </div>
            <button type="submit" className="button-3d" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
            </button>
          </div>
        </form>
      </aside>
    )
  }

  return (
    <aside className="cart">
      <header className="cart__header">
        <h2>Giỏ hàng</h2>
        <span className="cart__badge">{items.length} mặt hàng</span>
      </header>

      {items.length === 0 ? (
        <div className="cart__empty">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
          <p>Giỏ hàng đang trống.</p>
          <small>Thêm sản phẩm để tiếp tục mua sắm.</small>
        </div>
      ) : (
        <>
          <ul className="cart__items">
            {items.map((item) => (
              <li key={item.id} className="cart__item">
                <div style={{ flex: 1 }}>
                  <p className="cart__itemName">{item.name}</p>
                  <p className="cart__itemMeta">
                    {item.quantity} × {item.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </p>
                </div>
                <div className="cart__controls">
                  <button
                    className="cart__button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                  <button
                    className="cart__button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="cart__button cart__button--danger"
                    style={{ marginLeft: '8px', color: 'var(--danger)' }}
                    onClick={() => onRemove(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart__footer">
            <div className="cart__total">
              <span>Tổng cộng</span>
              <span className="cart__totalValue">
                {total.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </span>
            </div>
            <div className="cart__actions">
              <button className="button-3d secondary" style={{ flex: 1 }} onClick={onClear}>
                Xóa hết
              </button>
              <button className="button-3d" style={{ flex: 2 }} onClick={handleCheckoutClick}>
                {user ? 'Thanh toán' : '🔐 Đăng nhập để mua'}
              </button>
            </div>
            {!user && (
              <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '10px', color: 'var(--text-muted)' }}>
                Bạn cần đăng nhập để tiếp tục thanh toán.
              </p>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
