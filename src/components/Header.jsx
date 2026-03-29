import './Header.css'

export function Header({
  cartCount,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onManageClick,
  user,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  activeCategory,
  onCategorySelect,
}) {
  const categories = [
    { name: 'Tất cả', icon: '🌟' },
    { name: 'Điện thoại', icon: '📱' },
    { name: 'Laptop', icon: '💻' },
    { name: 'Máy tính bảng', icon: '📱' },
    { name: 'TV & Âm thanh', icon: '📺' },
    { name: 'Gia dụng', icon: '🧺' },
    { name: 'Thiết bị gia dụng', icon: '🏠' },
  ]

  return (
    <header className="tgddHeader">
      <div className="tgddHeader__top">
        <div className="tgddHeader__links">
          
          <a href="#">Hỗ trợ</a>
          <a href="#">Tra cứu đơn hàng</a>
        </div>
        <div className="tgddHeader__account">
          {user ? (
            <>
              <span className="tgddHeader__user">👤 Xin chào, <strong>{user.name}</strong></span>
              <button className="tgddHeader__link" onClick={onLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button className="tgddHeader__link" onClick={onLoginClick}>
                Đăng nhập
              </button>
              <button className="tgddHeader__link" onClick={onRegisterClick}>
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>

      <div className="tgddHeader__main">
        <div className="tgddHeader__brand" aria-label="Thế Giới Di Động">
          <span className="tgddHeader__brandMark" aria-hidden="true"></span>
          <span className="tgddHeader__brandText" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>React Shop</span>
        </div>

        <div className="tgddHeader__search">
          <input
            className="tgddHeader__searchInput"
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
            placeholder="Bạn tìm gì hôm nay?"
            aria-label="Tìm sản phẩm"
          />
          <button
            className="tgddHeader__searchButton"
            type="button"
            onClick={onSearchSubmit}
          >
            Tìm kiếm
          </button>
        </div>

        <div className="tgddHeader__actions">
          <button className="tgddHeader__action" type="button">
            <span className="tgddHeader__actionIcon" aria-hidden="true">💬</span>
            Hỗ trợ
          </button>
          {user && (user.role === 'staff' || user.role === 'admin') && (
            <button className="tgddHeader__action" type="button" onClick={onManageClick}>
              <span className="tgddHeader__actionIcon" aria-hidden="true">🛠️</span>
              Quản lý
            </button>
          )}
          <button
            className="tgddHeader__action"
            type="button"
            onClick={onCartClick}
            aria-label="Mở giỏ hàng"
          >
            <span className="tgddHeader__actionIcon" aria-hidden="true">🛒</span>
            <span className="tgddHeader__cartCount">{cartCount}</span>
          </button>
        </div>
      </div>

      <nav className="tgddHeader__nav" aria-label="Danh mục chính">
        {categories.map(cat => (
          <a
            key={cat.name}
            href="#"
            className="tgddHeader__navLink"
            style={{
              background: activeCategory === cat.name ? 'rgba(255, 212, 0, 0.2)' : '',
              borderColor: activeCategory === cat.name ? 'rgba(255, 212, 0, 0.8)' : ''
            }}
            onClick={(e) => { e.preventDefault(); onCategorySelect?.(cat.name); }}
          >
            <span className="tgddHeader__navIcon">{cat.icon}</span>
            <span>{cat.name}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}
