import { useState, useEffect } from 'react'
import './Reviews.css'

export function Reviews({ product, onClose, user }) {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    // Mock load reviews for product
    const stored = JSON.parse(window.localStorage.getItem(`shop-reviews-${product.id}`) || '[]')
    if (stored.length > 0) {
      setReviews(stored)
    } else {
      setReviews([
        { id: 1, user: 'Nguyen Van A', rating: 5, comment: 'Sản phẩm rất tốt, giao hàng nhanh!', date: '2026-04-20' },
        { id: 2, user: 'Tran Thi B', rating: 4, comment: 'Chất lượng ổn trong tầm giá.', date: '2026-04-22' }
      ])
    }
  }, [product.id])

  const saveReviews = (updated) => {
    setReviews(updated)
    window.localStorage.setItem(`shop-reviews-${product.id}`, JSON.stringify(updated))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newReview.comment.trim()) return

    const review = {
      id: Date.now(),
      user: user ? (user.name || user.email) : 'Khách ẩn danh',
      rating: Number(newReview.rating),
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    }

    saveReviews([review, ...reviews])
    setNewReview({ rating: 5, comment: '' })
  }

  return (
    <div className="reviewsOverlay" onClick={onClose}>
      <div className="reviewsModal glass" onClick={e => e.stopPropagation()}>
        <button className="reviews__close" onClick={onClose}>✕</button>
        <h2>Đánh giá: {product.name}</h2>
        
        <div className="reviews__list">
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="review__item">
                <div className="review__header">
                  <strong>{r.user}</strong>
                  <span className="review__stars">{'⭐'.repeat(r.rating)}</span>
                </div>
                <p className="review__comment">{r.comment}</p>
                <small className="review__date">{r.date}</small>
              </div>
            ))
          )}
        </div>

        <form className="reviews__form" onSubmit={handleSubmit}>
          <h3 style={{ margin: '20px 0 10px' }}>Viết đánh giá của bạn</h3>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Đánh giá sao:</label>
            <select 
              value={newReview.rating} 
              onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
              className="header__search-input"
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="5">⭐⭐⭐⭐⭐ (Tuyệt vời)</option>
              <option value="4">⭐⭐⭐⭐ (Tốt)</option>
              <option value="3">⭐⭐⭐ (Bình thường)</option>
              <option value="2">⭐⭐ (Tệ)</option>
              <option value="1">⭐ (Rất tệ)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Nội dung:</label>
            <textarea 
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
              className="header__search-input"
              style={{ width: '100%', padding: '10px', resize: 'vertical' }}
              rows={3}
              required
            />
          </div>
          <button type="submit" className="button-3d" style={{ width: '100%' }}>Đăng đánh giá</button>
        </form>
      </div>
    </div>
  )
}
