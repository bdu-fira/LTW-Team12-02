import { useState } from 'react'
import './ProductCard.css'

export function ProductCard({ product, onAdd, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)

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
      <img className="productCard__image" src={imageUrl} alt={product.name} />
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
          {isExpanded ? description : `${description.slice(0, MAX_LENGTH)}`}
          {!isExpanded && isLongDescription && '... '}
          {isLongDescription && (
            <button
              type="button"
              onClick={handleToggleDescription}
              style={{
                background: 'none',
                border: 'none',
                color: '#aa3bff',
                cursor: 'pointer',
                padding: 0,
                marginLeft: '4px',
                fontWeight: '600',
                fontSize: '0.9em',
              }}
            >
              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </p>
        <div className="productCard__footer">
          <strong className="productCard__price" style={{ color: '#d70018', fontSize: '1.1rem' }}>
            {product.price.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </strong>
          <div className="productCard__actions">
            <button
              type="button"
              className="productCard__button"
              onClick={() => onAdd(product)}
              aria-label={`Thêm ${product.name} vào giỏ`}
            >
              🛒 Thêm
            </button>
            {onDelete && (
              <button
                type="button"
                className="productCard__button productCard__button--danger"
                onClick={() => onDelete(product.id)}
                aria-label={`Xóa ${product.name}`}
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
