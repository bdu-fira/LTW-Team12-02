import { useState } from 'react'
import './ProductCard.css'
import { Reviews } from './Reviews'

export function ProductCard({ product, onAdd, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const imageUrl = String(product?.image || '') || 'https://via.placeholder.com/360x240?text=No+Image'

  const MAX_LENGTH = 80
  const description = String(product?.description || '')
  const isLongDescription = description.length > MAX_LENGTH

  const handleToggleDescription = (e) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <article className="productCard">
      <div className="productCard__image-container">
        <span className="productCard__category">
          {product.category || 'Khác'}
        </span>
        <img className="productCard__image" src={imageUrl} alt={product.name} />
      </div>
      
      <div className="productCard__body">
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          color: '#00a650',
          textTransform: 'uppercase',
          backgroundColor: 'rgba(0, 166, 80, 0.1)',
          padding: '2px 8px',
          borderRadius: '4px',
          alignSelf: 'flex-start',
          marginBottom: '-6px'
        }}>
          {product.category || 'Khác'}
        </span>
        <h3 className="productCard__title">{product.name}</h3>
        <p className="productCard__description" onClick={handleToggleDescription} style={{ cursor: isLongDescription ? 'pointer' : 'default' }}>
          {isLongDescription && !isExpanded ? `${description.slice(0, MAX_LENGTH)}...` : description}
          {isLongDescription && (
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: '4px' }}>
              {isExpanded ? ' Thu gọn' : ' Xem thêm'}
            </span>
          )}
        </p>

        <div className="productCard__stats" style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', alignItems: 'center' }}>
          <span>📈 Đã bán: <strong>{product.sold_count || 0}</strong></span>
          <span>📦 Còn lại: <strong style={{ color: (product.stock_count || 0) < 5 ? 'var(--danger)' : 'inherit' }}>{product.stock_count || 0}</strong></span>
          <span 
            style={{ marginLeft: 'auto', cursor: 'pointer', color: '#f59e0b', fontWeight: 'bold' }}
            onClick={(e) => { e.stopPropagation(); setShowReviews(true); }}
          >
            ⭐⭐⭐⭐⭐
          </span>
        </div>
        
        <div className="productCard__footer">
          <strong className="productCard__price" style={{ color: '#d70018', fontSize: '1.1rem' }}>
            {product.price.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </strong>
          
          <div className="productCard__actions" style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="button-3d"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              onClick={() => onAdd(product)}
              aria-label={`Thêm ${product.name} vào giỏ`}
            >
              🛒 Mua
            </button>
            
            {onDelete && (
              <button
                type="button"
                className="button-3d secondary"
                style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--danger)' }}
                onClick={() => onDelete(product.id)}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>
      {showReviews && (
        <Reviews 
          product={product} 
          onClose={(e) => { e?.stopPropagation(); setShowReviews(false); }} 
        />
      )}
    </article>
  )
}

