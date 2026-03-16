import './Cart.css'

export function Cart({ items, onUpdateQuantity, onRemove, onClear }) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <aside className="cart">
      <header className="cart__header">
        <h2>Giỏ hàng</h2>
        <span className="cart__badge">{items.length}</span>
      </header>

      {items.length === 0 ? (
        <div className="cart__empty">
          <p>Giỏ hàng đang trống.</p>
          <small>Thêm sản phẩm vào giỏ để tiếp tục.</small>
        </div>
      ) : (
        <>
          <ul className="cart__items">
            {items.map((item) => (
              <li key={item.id} className="cart__item">
                <div>
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
                    aria-label={`Giảm số lượng ${item.name}`}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <button
                    className="cart__button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    aria-label={`Tăng số lượng ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    className="cart__button cart__button--danger"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Xóa ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart__footer">
            <div className="cart__total">
              <span>Tổng</span>
              <span className="cart__totalValue">
                {total.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </span>
            </div>
            <div className="cart__actions">
              <button className="cart__clear" onClick={onClear}>
                Xóa giỏ
              </button>
              <button className="cart__checkout" disabled>
                Thanh toán (sắp có)
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
