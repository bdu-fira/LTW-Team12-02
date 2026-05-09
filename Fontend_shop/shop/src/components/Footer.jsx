import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      alert(`Đăng ký thành công! Email ${email} sẽ nhận được khuyến mãi sớm nhất.`)
      setEmail('')
    } else {
      alert('Vui lòng nhập email của bạn!')
    }
  }

  const handleMockLink = (e, featureName) => {
    e.preventDefault()
    alert(`Tính năng "${featureName}" đang được phát triển!`)
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__col">
            <Link to="/" className="footer__logo" onClick={handleScrollToTop}>
              <div className="footer__logo-icon">🛒</div>
              <span className="footer__brand">Gia dụng Xanh</span>
            </Link>
            <p className="footer__text">
              Chúng tôi cung cấp các giải pháp công nghệ hiện đại nhằm nâng cao chất lượng cuộc sống cho mọi gia đình Việt.
            </p>
            <div className="footer__socials">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer__social-btn">f</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer__social-btn">𝕏</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer__social-btn">in</a>
            </div>
          </div>

          <div className="footer__col">
            <h3 className="footer__subtitle">Mua sắm</h3>
            <ul className="footer__links">
              <li><Link to="/" onClick={handleScrollToTop} className="footer__link">Tất cả sản phẩm</Link></li>
              <li><Link to="/" onClick={handleScrollToTop} className="footer__link">Sản phẩm mới nhất</Link></li>
              <li><Link to="/" onClick={handleScrollToTop} className="footer__link">Khuyến mãi HOT</Link></li>
              <li><Link to="/" onClick={handleScrollToTop} className="footer__link">Bộ sưu tập 2026</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__subtitle">Hỗ trợ</h3>
            <ul className="footer__links">
              <li><Link to="/policy/warranty" className="footer__link">Trung tâm bảo hành</Link></li>
              <li><Link to="/policy/faq" className="footer__link">Câu hỏi thường gặp</Link></li>
              <li><Link to="/policy/return" className="footer__link">Chính sách đổi trả</Link></li>
              <li><Link to="/policy/shipping" className="footer__link">Giao hàng & Lắp đặt</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__subtitle">Bản tin</h3>
            <p className="footer__text">
              Đăng ký nhận thông tin khuyến mãi sớm nhất từ chúng tôi.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="header__search-input" 
                style={{ padding: '8px 12px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="button-3d" style={{ padding: '8px 16px' }}>Gửi</button>
            </form>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {currentYear} Nhóm 12. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/policy/terms" className="footer__link">Điều khoản</Link>
            <Link to="/policy/privacy" className="footer__link">Bảo mật</Link>
            <Link to="/policy/cookies" className="footer__link">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
