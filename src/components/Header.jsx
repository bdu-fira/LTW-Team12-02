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
<<<<<<< HEAD
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
=======
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
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
                Đăng nhập
              </button>
            )}

            {(user?.role === 'staff' || user?.role === 'admin') && (
              <button className="button-3d secondary" onClick={onManageClick}>
                🛠️ Quản lý
              </button>
            )}

<<<<<<< HEAD
            <button
              className="button-3d"
              type="button"
              onClick={onCartClick}
              aria-label="Mở giỏ hàng"
              style={{ padding: '12px 18px' }}
            >
              <span className="header__cart-icon">🛒</span>
              {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
=======
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
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
            </button>
          </div>
        </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> a97095c38f2510f165a15b5c9b1891a2466cecaa
    </header>
  )
}
