import './AddProductModal.css'

export function AddProductModal({ onClose, onAdd }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const name = formData.get('name')?.toString().trim()
    const price = formData.get('price')?.toString().trim()
    const image = formData.get('image')?.toString().trim()
    const description = formData.get('description')?.toString().trim()

    if (!name || !price) return

    onAdd({ name, price, image, description })
  }

  return (
    <div className="addProductOverlay" onClick={onClose}>
      <div className="addProductModal" onClick={(e) => e.stopPropagation()}>
        <header className="addProductModal__header">
          <h2>Thêm sản phẩm</h2>
          <button className="addProductModal__close" onClick={onClose}>
            ✕
          </button>
        </header>

        <form className="addProductModal__form" onSubmit={handleSubmit}>
          <label className="addProductModal__label">
            Tên sản phẩm
            <input name="name" type="text" placeholder="Ví dụ: Tai nghe bluetooth" required />
          </label>

          <label className="addProductModal__label">
            Giá (VNĐ)
            <input
              name="price"
              type="number"
              min="0"
              step="1000"
              placeholder="Ví dụ: 150000"
              required
            />
          </label>

          <label className="addProductModal__label">
            Ảnh (URL)
            <input name="image" type="url" placeholder="https://..." />
          </label>

          <label className="addProductModal__label">
            Mô tả
            <textarea name="description" placeholder="Mô tả ngắn về sản phẩm" rows="3" />
          </label>

          <button type="submit" className="addProductModal__submit">
            Lưu sản phẩm
          </button>
        </form>
      </div>
    </div>
  )
}
