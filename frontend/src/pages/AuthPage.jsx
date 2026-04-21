import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './AuthPage.css'

export function AuthPage({ onAuth, user, onLogout }) {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const title = mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
  const submitLabel = mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'
  const navigate = useNavigate()

  const [formError, setFormError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString().trim()
    const name = formData.get('name')?.toString().trim()

    if (!email || !password) {
      setFormError('Vui lòng điền đầy đủ email và mật khẩu.')
      return
    }

    onAuth({ email, password, name, mode })
      .then((user) => {
        if (user?.role === 'admin') {
          navigate('/admin')
        } else if (user?.role === 'staff') {
          navigate('/staff')
        } else {
          navigate('/')
        }
      })
      .catch((err) => {
        setFormError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      })
  }

  const toggleMode = () => {
    navigate('/auth?mode=' + (mode === 'login' ? 'register' : 'login'))
  }

  const loggedIn = Boolean(user)

  return (
    <div className="authPage container">
      <div className="authPage__card">
        <header className="authPage__header">
          <h1>{title}</h1>
          <p className="authPage__subtitle">
            {loggedIn ? 'Bạn đã đăng nhập vào hệ thống.' : 'Hãy nhập thông tin để tiếp tục.'}
          </p>
        </header>

        {loggedIn ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="button-3d" onClick={() => navigate('/')}>
              Về trang chủ
            </button>
            <button className="button-3d secondary" onClick={() => onLogout()}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <form className="authPage__form" onSubmit={handleSubmit}>
            {formError && <div className="authPage__error">{formError}</div>}

            {mode === 'register' && (
              <label className="authPage__label">
                Họ và tên
                <input name="name" type="text" placeholder="Nguyễn Văn A" required />
              </label>
            )}

            <label className="authPage__label">
              Email
              <input name="email" type="email" placeholder="example@email.com" required />
            </label>

            <label className="authPage__label">
              Mật khẩu
              <input name="password" type="password" placeholder="••••••••" required />
            </label>

            <button type="submit" className="button-3d" style={{ marginTop: '10px' }}>
              {submitLabel}
            </button>

            <div className="authPage__switch">
              {mode === 'login' ? (
                <>
                  Chưa có tài khoản?{' '}
                  <button type="button" className="authPage__link" onClick={toggleMode}>
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button type="button" className="authPage__link" onClick={toggleMode}>
                    Đăng nhập
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
