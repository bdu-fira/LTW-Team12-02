import { useState } from 'react'
import './ProductCard.css'

export function ProductCard({ product, onAdd, onDelete }) {
<<<<<<< HEAD
  const imageUrl = String(product?.image || '') || 'https://via.placeholder.com/360x240?text=No+Image'
  const description = String(product?.description || '')
=======
  const [isExpanded, setIsExpanded] = useState(false)

  const imageUrl = String(product?.image || '') || 'https://via.placeholder.com/360x240?text=No+Image'

  const MAX_LENGTH = 80
  const description = String(product?.description || '')
  const isLongDescription = description.length > MAX_LENGTH

  const handleToggleDescription = (e) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa

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
        <p className="productCard__description">
          {description}
        </p>
        
        <div className="productCard__footer">
<<<<<<< HEAD
          <strong className="productCard__price">
=======
          <strong className="productCard__price" style={{ color: '#d70018', fontSize: '1.1rem' }}>
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
            {product.price.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </strong>
<<<<<<< HEAD
          
          <div style={{ display: 'flex', gap: '8px' }}>
=======
          <div className="productCard__actions">
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
            <button
              type="button"
              className="button-3d"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              onClick={() => onAdd(product)}
              aria-label={`Thêm ${product.name} vào giỏ`}
            >
<<<<<<< HEAD
              🛒 Mua
=======
              🛒 Thêm
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
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
