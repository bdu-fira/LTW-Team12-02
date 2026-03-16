import { useState } from 'react'
import './ProductCard.css'

export function ProductCard({ product, onAdd, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const imageUrl = product.image || 'https://via.placeholder.com/360x240?text=No+Image'

  const MAX_LENGTH = 80
  const description = product.description || ''
  const isLongDescription = description.length > MAX_LENGTH

  const handleToggleDescription = (e) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <article className="productCard">
      <img className="productCard__image" src={imageUrl} alt={product.name} />
      <div className="productCard__body">
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
          <span className="productCard__price">
            {product.price.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </span>
          <div className="productCard__actions">
            <button
              type="button"
              className="productCard__button"
              onClick={() => onAdd(product)}
              aria-label={`Thêm ${product.name} vào giỏ`}
            >
              Thêm vào giỏ
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
