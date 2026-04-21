import { useState, useEffect } from 'react';
import './Reviews.css';

export function Reviews({ productId, productName, onClose, user }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:4000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_name: user?.name || 'Khách ẩn danh',
          rating,
          comment
        })
      });

      if (res.ok) {
        setComment('');
        setRating(5);
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reviews-overlay" onClick={onClose}>
      <div className="reviews-modal glass" onClick={e => e.stopPropagation()}>
        <header className="reviews-header">
          <h2>Đánh giá - {productName}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="reviews-content">
          <section className="review-form">
            <h3>Viết đánh giá của bạn</h3>
            <form onSubmit={handleSubmit}>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    className={`star ${rating >= star ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea 
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />
              <button type="submit" className="button-3d" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </section>

          <section className="reviews-list">
            <h3>Nhận xét từ khách hàng ({reviews.length})</h3>
            {isLoading ? (
              <p>Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-meta">
                    <span className="user-name">{review.user_name}</span>
                    <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                    <span className="date">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="comment">{review.comment}</p>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
