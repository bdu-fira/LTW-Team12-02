import { useState, useEffect } from 'react';
import './FlashSale.css';

export function FlashSale({ products = [] }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 45,
    seconds: 30
  });

  const flashSaleProducts = products.filter(p => p.is_flash_sale);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (hours === 0 && minutes === 0 && seconds === 0) {
          hours = 24; // reset for demo
        }
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => time < 10 ? `0${time}` : time;

  if (flashSaleProducts.length === 0) return null;

  return (
    <section className="flash-sale container">
      <div className="flash-sale__inner">
        <div className="flash-sale__header">
          <div className="flash-sale__title">
            <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>⚡</span>
            <h2>Khuyến Mãi Chớp Nhoáng</h2>
          </div>
          <div className="flash-sale__timer">
            <span>Kết thúc sau:</span>
            <div className="timer-box">
              <span className="time">{formatTime(timeLeft.hours)}</span>
              <span className="colon">:</span>
              <span className="time">{formatTime(timeLeft.minutes)}</span>
              <span className="colon">:</span>
              <span className="time">{formatTime(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>
        
        <div className="flash-sale__cards">
          {flashSaleProducts.map(p => {
            const discount = p.old_price > p.price 
              ? Math.round(((p.old_price - p.price) / p.old_price) * 100) 
              : 0;
            
            // Real progress based on sales and stock
            const total = (p.sold_count || 0) + (p.stock_count || 0);
            const progress = total > 0 
              ? Math.round((p.sold_count / total) * 100) 
              : 0;

            const isLowStock = p.stock_count > 0 && p.stock_count < 5;

            return (
              <div className="flash-sale__card" key={p.id}>
                {discount > 0 && <div className="flash-sale__badge">-{discount}%</div>}
                <img src={p.image || "https://picsum.photos/seed/placeholder/200/200"} alt={p.name} />
                <h4 className="fs-name">{p.name}</h4>
                <div className="fs-price">
                  <span className="fs-new-price">{p.price.toLocaleString('vi-VN')}₫</span>
                  {p.old_price > 0 && <span className="fs-old-price">{p.old_price.toLocaleString('vi-VN')}₫</span>}
                </div>
                <div className="fs-progress">
                  <div className={isLowStock ? "fs-progress-bar-fire" : "fs-progress-bar"} style={{ width: `${progress}%` }}></div>
                  <span className="fs-progress-text">{isLowStock ? '🔥 Sắp cháy hàng' : `Đã bán ${p.sold_count || 0}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
