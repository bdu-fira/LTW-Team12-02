import './AuthModal.css'

export function AuthModal({ mode, onClose, onAuth }) {
  const title = mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
  const submitLabel = mode === 'login' ? 'Đăng nhập' : 'Đăng ký'

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString().trim()
    const name = formData.get('name')?.toString().trim()

    if (!email || !password) return
    onAuth({ email, password, name })
  }

  return (
    <div className="authModalOverlay" onClick={onClose}>
      <div className="authModal" onClick={(e) => e.stopPropagation()}>
        <header className="authModal__header">
          <h2>{title}</h2>
          <button className="authModal__close" onClick={onClose}>
            ✕
          </button>
        </header>
        <form className="authModal__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="authModal__label">
              Họ và tên
              <input name="name" type="text" placeholder="Ví dụ: Nguyễn Văn A" required />
            </label>
          )}
          <label className="authModal__label">
            Email
            <input name="email" type="email" placeholder="email@domain.com" required />
          </label>
          <label className="authModal__label">
            Mật khẩu
            <input name="password" type="password" placeholder="Tối thiểu 6 ký tự" required />
          </label>

          <button type="submit" className="authModal__submit">
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
