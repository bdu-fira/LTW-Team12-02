import './Footer.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__col">
            <a href="/" className="footer__logo">
              <div className="footer__logo-icon">🛒</div>
              <span className="footer__brand">Gia dụng Xanh</span>
            </a>
            <p className="footer__text">
              Chúng tôi cung cấp các giải pháp công nghệ hiện đại nhằm nâng cao chất lượng cuộc sống cho mọi gia đình Việt.
            </p>
            <div className="footer__socials">
              <div className="footer__social-btn">f</div>
              <div className="footer__social-btn">𝕏</div>
              <div className="footer__social-btn">in</div>
            </div>
          </div>

          <div className="footer__col">
            <h3 className="footer__subtitle">Mua sắm</h3>
            <ul className="footer__links">
              <li><a href="#" className="footer__link">Tất cả sản phẩm</a></li>
              <li><a href="#" className="footer__link">Sản phẩm mới nhất</a></li>
              <li><a href="#" className="footer__link">Khuyến mãi HOT</a></li>
              <li><a href="#" className="footer__link">Bộ sưu tập 2024</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__subtitle">Hỗ trợ</h3>
            <ul className="footer__links">
              <li><a href="#" className="footer__link">Trung tâm bảo hành</a></li>
              <li><a href="#" className="footer__link">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="footer__link">Chính sách đổi trả</a></li>
              <li><a href="#" className="footer__link">Giao hàng & Lắp đặt</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__subtitle">Bản tin</h3>
            <p className="footer__text">
              Đăng ký nhận thông tin khuyến mãi sớm nhất từ chúng tôi.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="header__search-input" 
                style={{ padding: '8px 12px' }}
              />
              <button className="button-3d" style={{ padding: '8px 16px' }}>Gửi</button>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {currentYear} Gia dụng Xanh. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" className="footer__link">Điều khoản</a>
            <a href="#" className="footer__link">Bảo mật</a>
            <a href="#" className="footer__link">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
