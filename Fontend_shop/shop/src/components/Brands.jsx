import './Brands.css';

export function Brands() {
  const brands = [
    { name: 'Apple', logo: '🍎', color: '#a8a8a8' },
    { name: 'Samsung', logo: '📱', color: '#034ea2' },
    { name: 'Sony', logo: '📷', color: '#888888' },
    { name: 'Xiaomi', logo: '🦊', color: '#ff6700' },
    { name: 'Dell', logo: '💻', color: '#0076ce' },
    { name: 'LG', logo: '📺', color: '#a50034' }
  ];

  return (
    <section className="brands container">
      <div className="brands__header">
        <h2 className="brands__title">Thương Hiệu Nổi Bật</h2>
        <p className="brands__subtitle">Đối tác chiến lược cung cấp sản phẩm chính hãng</p>
      </div>
      
      <div className="brands__grid">
        {brands.map((brand) => (
          <div key={brand.name} className="brand-card glass" style={{ '--brand-color': brand.color }}>
            <div className="brand-card__logo-wrapper">
              <span className="brand-card__logo-icon">{brand.logo}</span>
            </div>
            <span className="brand-card__name">{brand.name}</span>
            <div className="brand-card__glow"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
