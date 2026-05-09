import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetailPage.css';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="pdp-star-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`pdp-star ${star <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(star)}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
        >★</span>
      ))}
    </div>
  );
}

export function ProductDetailPage({ onAdd, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:4000/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Không tìm thấy sản phẩm.');
          throw new Error('Lỗi khi tải thông tin sản phẩm.');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/reviews/${id}`);
      if (res.ok) setReviews(await res.json());
    } catch (e) {}
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return setReviewError('Bạn cần đăng nhập để đánh giá sản phẩm.');
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const res = await fetch(`http://localhost:4000/api/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: user.email, rating: reviewRating, comment: reviewComment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gửi đánh giá thất bại.');
      setReviewSuccess('✅ Cảm ơn bạn đã đánh giá sản phẩm!');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (isLoading) {
    return <div className="pdp-container pdp-center"><h2>Đang tải sản phẩm...</h2></div>;
  }

  if (error || !product) {
    return (
      <div className="pdp-container pdp-center">
        <h2>{error || 'Sản phẩm không tồn tại.'}</h2>
        <button className="button-3d" onClick={() => navigate('/')}>Quay lại trang chủ</button>
      </div>
    );
  }

  const imageUrl = String(product?.image || '') || 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="pdp-container">
      <button className="pdp-back-btn" onClick={() => navigate(-1)}>
        &larr; Quay lại
      </button>

      <div className="pdp-content">
        <div className="pdp-image-section">
          <img src={imageUrl} alt={product.name} className="pdp-image" />
          {product.is_flash_sale && <span className="pdp-flash-badge">⚡ Flash Sale</span>}
        </div>
        
        <div className="pdp-info-section">
          <span className="pdp-category">{product.category || 'Khác'}</span>
          <h1 className="pdp-title">{product.name}</h1>
          
          {avgRating && (
            <div className="pdp-avg-rating">
              <StarRating value={Math.round(avgRating)} />
              <span className="pdp-avg-score">{avgRating} / 5</span>
              <span className="pdp-review-count">({reviews.length} đánh giá)</span>
            </div>
          )}

          <div className="pdp-price">
            {Number(product.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </div>
          
          {product.old_price && (
            <div className="pdp-old-price">
              Giá gốc: <del>{Number(product.old_price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</del>
            </div>
          )}

          <div className="pdp-stats">
            <span>📈 Đã bán: <strong>{product.sold_count || 0}</strong></span>
            <span>📦 Còn trong kho: <strong>{product.stock_count || 0}</strong></span>
          </div>

          <div className="pdp-description-box">
            <h3>Mô tả sản phẩm</h3>
            <p className="pdp-description">{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
          </div>

          <div className="pdp-actions">
            <button 
              className="button-3d pdp-add-cart-btn" 
              onClick={() => {
                onAdd(product);
                alert('Đã thêm sản phẩm vào giỏ hàng!');
              }}
            >
              🛒 Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* ===== REVIEWS SECTION ===== */}
      <section className="pdp-reviews-section">
        <h2 className="pdp-reviews-title">⭐ Đánh giá sản phẩm</h2>

        {/* Form gửi đánh giá */}
        <div className="pdp-review-form-card glass">
          <h3>{user ? `Đánh giá của ${user.name || user.email}` : 'Đăng nhập để đánh giá'}</h3>
          {user ? (
            <form onSubmit={handleSubmitReview} className="pdp-review-form">
              <div className="pdp-review-form-row">
                <label>Chọn số sao:</label>
                <StarRating value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea
                className="pdp-review-textarea"
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                rows={4}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
              />
              {reviewError && <p className="pdp-review-error">{reviewError}</p>}
              {reviewSuccess && <p className="pdp-review-success">{reviewSuccess}</p>}
              <button className="button-3d" type="submit" disabled={reviewLoading}>
                {reviewLoading ? '⏳ Đang gửi...' : '📝 Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <p className="pdp-review-login-hint">
              Bạn cần <button className="pdp-review-link" onClick={() => navigate('/auth?mode=login')}>đăng nhập</button> để đánh giá sản phẩm.
            </p>
          )}
        </div>

        {/* Danh sách đánh giá */}
        <div className="pdp-reviews-list">
          {reviews.length === 0 ? (
            <div className="pdp-no-reviews">
              <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này! 🎉</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="pdp-review-card glass">
                <div className="pdp-review-header">
                  <div className="pdp-reviewer-avatar">{(r.user_email || '?')[0].toUpperCase()}</div>
                  <div>
                    <div className="pdp-reviewer-email">{r.user_email}</div>
                    <div className="pdp-review-date">{new Date(r.created_at).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="pdp-review-comment">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
