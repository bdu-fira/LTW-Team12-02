import './Hero.css'

export function Hero() {
  const scrollToProducts = () => {
    document.querySelector('.products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero container">
      <div className="hero__content">
        <div className="hero__badge">
          <span>✨ Mùa mua sắm 2026</span>
        </div>
        <h1 className="hero__title">
          Thiết bị công nghệ 
          <span>Tầm cao mới</span>
        </h1>
        <p className="hero__description">
          Khám phá những sản phẩm điện tử chính hãng với dịch vụ bảo hành tận tâm và ưu đãi độc quyền chỉ dành cho bạn.
        </p>
        <div className="hero__actions">
          <button className="button-3d" onClick={scrollToProducts}>
            🛒 Mua sắm ngay
          </button>
          <button className="button-3d secondary">
            🎁 Ưu đãi hôm nay
          </button>
        </div>
      </div>
      <div className="hero__visual">
        <div className="hero__glow"></div>
        <div className="hero__image-wrapper">
          <img 
            src="https://picsum.photos/seed/tech/1000/800" 
            alt="Premium Technology" 
            className="hero__image"
          />
        </div>
      </div>
    </section>
  )
}
