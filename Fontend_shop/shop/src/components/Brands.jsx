import './Brands.css';

export function Brands() {
  const brands = [
    { name: 'Apple', logo: '🍎', color: '#000000', bgColor: '#f5f5f7' },
    { name: 'Samsung', logo: '📱', color: '#034ea2', bgColor: '#eef2f8' },
    { name: 'Sony', logo: '📷', color: '#000000', bgColor: '#f0f0f0' },
    { name: 'Xiaomi', logo: '🦊', color: '#ff6700', bgColor: '#fff4ed' },
    { name: 'Dell', logo: '💻', color: '#0076ce', bgColor: '#e8f4ff' },
    { name: 'LG', logo: '📺', color: '#a50034', bgColor: '#ffedf1' }
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
            <div className="brand-card__logo-wrapper" style={{ backgroundColor: brand.bgColor }}>
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
