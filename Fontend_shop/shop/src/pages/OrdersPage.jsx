import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

export function OrdersPage({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/orders/${user.email}`);
        if (!res.ok) throw new Error('Không thể tải lịch sử mua hàng.');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo(0, 0);
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="orders-page container" style={{ padding: '40px 0', minHeight: '60vh' }}>
      <header className="orders-header">
        <h2>Lịch sử mua hàng</h2>
        <p>Theo dõi và quản lý các đơn hàng bạn đã đặt tại Gia dụng Xanh.</p>
      </header>

      {isLoading ? (
        <div className="orders-message">Đang tải lịch sử mua hàng...</div>
      ) : error ? (
        <div className="orders-message error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <div className="empty-icon">📦</div>
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p>
          <button className="button-3d" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const date = new Date(order.created_at).toLocaleDateString('vi-VN', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Mã đơn: #{order.id}</span>
                    <span className="order-date">{date}</span>
                  </div>
                  <div className={`order-status status-${order.status || 'pending'}`}>
                    {order.status === 'pending' ? '⏳ Đang xử lý' : order.status === 'completed' ? '✅ Đã giao' : '❌ Đã hủy'}
                  </div>
                </div>

                <div className="order-items">
                  {items.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.image || "https://picsum.photos/100"} alt={item.name} className="order-item-img" />
                      <div className="order-item-info">
                        <h4>{item.name}</h4>
                        <p>Số lượng: {item.quantity}</p>
                      </div>
                      <div className="order-item-price">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-shipping-info">
                    <p><strong>Người nhận:</strong> {order.customer_name}</p>
                    <p><strong>SĐT:</strong> {order.phone}</p>
                    <p><strong>Địa chỉ:</strong> {order.address}</p>
                  </div>
                  <div className="order-total-summary">
                    <span className="total-label">Tổng cộng:</span>
                    <span className="total-price">{Number(order.total).toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
