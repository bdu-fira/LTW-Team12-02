import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './AuthPage.css'

export function AuthPage({ onAuth, user, onLogout }) {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const title = mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
  const submitLabel = mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
  const navigate = useNavigate()

  const [formError, setFormError] = useState('')
  const [pendingEmail, setPendingEmail] = useState(() =>
    window.localStorage.getItem('shop-pending-staff') || '',
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString().trim()
    const name = formData.get('name')?.toString().trim()
    const role = formData.get('role')?.toString().trim() || 'customer'

    if (!email || !password) {
      setFormError('Vui lòng điền đầy đủ email và mật khẩu.')
      return
    }

    onAuth({ email, password, name, role, mode })
      .then((user) => {
        // If staff registers, their account must be approved first.
        if (mode === 'register' && user?.role === 'staff' && !user.approved) {
          setPendingEmail(user.email)
          window.localStorage.setItem('shop-pending-staff', user.email)
          return
        }

        // If the user logged in and happens to match a pending staff, clear the pending flag.
        const pending = window.localStorage.getItem('shop-pending-staff')
        if (pending && user?.email === pending) {
          window.localStorage.removeItem('shop-pending-staff')
          setPendingEmail('')
        }

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

  const pendingStatus = useMemo(() => {
    if (!pendingEmail) return false
    const users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
    const pendingUser = users.find((u) => u.email === pendingEmail)
    return Boolean(pendingUser && pendingUser.role === 'staff' && !pendingUser.approved)
  }, [pendingEmail])

  const description = useMemo(() => {
    if (!loggedIn && pendingStatus) {
      return 'Tài khoản nhân viên của bạn đang chờ duyệt. Vui lòng chờ quản trị viên duyệt.'
    }

    if (loggedIn) return 'Bạn đã đăng nhập. Có thể thoát bằng nút bên dưới.'
    if (mode === 'login') return 'Nhập email và mật khẩu để đăng nhập.'
    return (
      'Tạo tài khoản mới để vào hệ thống. Nếu bạn là nhân viên, tài khoản sẽ được duyệt trước khi vào được phần quản lý.'
    )
  }, [loggedIn, mode, pendingStatus])

  return (
    <div className="authPage">
      <div className="authPage__card">
        <header className="authPage__header">
          <h1>{title}</h1>
          <p className="authPage__subtitle">{description}</p>
        </header>

        {loggedIn ? (
          <div className="authPage__actions">
            <button className="button" onClick={() => onLogout()}>
              Đăng xuất
            </button>
            <button className="button button--secondary" onClick={() => navigate('/') }>
              Về trang chủ
            </button>
          </div>
        ) : (
          <>
            {pendingStatus && (
              <div className="authPage__pending">
                <p>
                  Tài khoản nhân viên của bạn đang chờ duyệt. Vui lòng đợi quản trị viên duyệt.
                </p>
              </div>
            )}

            <form className="authPage__form" onSubmit={handleSubmit}>
              {formError && <div className="authPage__error">{formError}</div>}

            {mode === 'register' && (
              <>
                <label className="authPage__label">
                  Họ và tên
                  <input name="name" type="text" placeholder="Ví dụ: Nguyễn Văn A" />
                </label>
                <label className="authPage__label">
                  Loại tài khoản
                  <select name="role" defaultValue="customer">
                    <option value="customer">Khách hàng</option>
                    <option value="staff">Nhân viên (cần duyệt)</option>
                  </select>
                </label>
              </>
            )}

            <label className="authPage__label">
              Email
              <input name="email" type="email" placeholder="email@domain.com" required />
            </label>

            <label className="authPage__label">
              Mật khẩu
              <input name="password" type="password" placeholder="Tối thiểu 6 ký tự" required />
            </label>

            <button type="submit" className="button">
              {submitLabel}
            </button>

            <div className="authPage__switch">
              {mode === 'login' ? (
                <>
                  Bạn chưa có tài khoản?{' '}
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
          </>
        )}
      </div>
    </div>
  )
}
