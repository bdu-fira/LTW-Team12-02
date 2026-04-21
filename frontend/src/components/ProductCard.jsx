import { useState } from 'react'
import './ProductCard.css'

export function ProductCard({ product, onAdd, onDelete, onShowReviews }) {
  const imageUrl = String(product?.image || '') || 'https://via.placeholder.com/360x240?text=No+Image'
  const description = String(product?.description || '')

  return (
    <article className="productCard">
      <div className="productCard__image-container">
        <span className="productCard__category">
          {product.category || 'Khác'}
        </span>
        <img className="productCard__image" src={imageUrl} alt={product.name} />
      </div>
      
      <div className="productCard__body">
        <h3 className="productCard__title">{product.name}</h3>
        <p className="productCard__description">
          {description}
        </p>
        
        <div className="productCard__footer">
          <strong className="productCard__price">
            {product.price.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </strong>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="button-3d secondary"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              onClick={() => onShowReviews && onShowReviews(product)}
            >
              ⭐ Đánh giá
            </button>
            
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
    </article>
  )
}
