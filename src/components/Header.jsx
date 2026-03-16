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
}) {
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
              <span className="tgddHeader__user">Xin chào, {user.name}</span>
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
          <span className="tgddHeader__brandText">Web bán thiết bị điện tử  </span>
        </div>

        <div className="tgddHeader__search">
          <select className="tgddHeader__searchCategory" aria-label="Chọn danh mục">
            <option>Toàn bộ</option>
            <option>Điện thoại</option>
            <option>Laptop</option>
            <option>TV</option>
            <option>Gia dụng</option>
          </select>
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
          {user && (user.role === 'staff' || user.role === 'admin') && user.approved && (
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
        <a href="#" className="tgddHeader__navLink">
          <span className="tgddHeader__navIcon">📱</span>
          <span>Điện thoại</span>
        </a>
        <a href="#" className="tgddHeader__navLink">
          <span className="tgddHeader__navIcon">💻</span>
          <span>Laptop</span>
        </a>
        <a href="#" className="tgddHeader__navLink">
          <span className="tgddHeader__navIcon">📱</span>
          <span>Máy tính bảng</span>
        </a>
        <a href="#" className="tgddHeader__navLink">
          <span className="tgddHeader__navIcon">📺</span>
          <span>TV & Âm thanh</span>
        </a>
        <a href="#" className="tgddHeader__navLink">
          <span className="tgddHeader__navIcon">🧺</span>
          <span>Gia dụng</span>
        </a>
        <a href="#" className="tgddHeader__navLink">
          <span className="tgddHeader__navIcon">🏠</span>
          <span>Thiết bị gia dụng</span>
        </a>
      </nav>
    </header>
  )
}
