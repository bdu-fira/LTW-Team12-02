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
    <header className="header">
      <div className="container">
        <div className="header__top">
          <a className="header__brand" href="/">
            <div className="header__logo-circle">🛒</div>
            <span className="header__title">Gia dụng Xanh</span>
          </a>

          <div className="header__search-container">
            <input
              className="header__search-input"
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
              placeholder="Tìm kiếm sản phẩm công nghệ..."
              aria-label="Tìm sản phẩm"
            />
            <span className="header__search-icon" onClick={onSearchSubmit}>🔍</span>
          </div>

          <div className="header__actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="header__user-info" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Chào, <strong>{user.name}</strong>
                </span>
                <button className="button-3d secondary" style={{ padding: '8px 16px' }} onClick={onLogout}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button className="button-3d" onClick={onLoginClick}>
                Đăng nhập
              </button>
            )}

            {(user?.role === 'staff' || user?.role === 'admin') && (
              <button className="button-3d secondary" onClick={onManageClick}>
                🛠️ Quản lý
              </button>
            )}

            <button
              className="button-3d"
              type="button"
              onClick={onCartClick}
              aria-label="Mở giỏ hàng"
              style={{ padding: '12px 18px' }}
            >
              <span className="header__cart-icon">🛒</span>
              {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        <nav className="header__nav" aria-label="Danh mục chính">
          {categories.map(cat => (
            <div
              key={cat.name}
              className={`header__nav-item ${activeCategory === cat.name ? 'header__nav-item--active' : ''}`}
              onClick={() => onCategorySelect?.(cat.name)}
            >
              <span className="header__nav-icon">{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}
