import { useState, useEffect } from 'react';
import './FlashSale.css';

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 45,
    seconds: 30
  });

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
          <div className="flash-sale__card">
            <div className="flash-sale__badge">-30%</div>
            <img src="https://picsum.photos/seed/sale1/200/200" alt="Tai nghe không dây" />
            <h4 className="fs-name">Tai nghe Sony WH-1000XM5</h4>
            <div className="fs-price">
              <span className="fs-new-price">6.990.000₫</span>
              <span className="fs-old-price">8.990.000₫</span>
            </div>
            <div className="fs-progress">
              <div className="fs-progress-bar" style={{ width: '85%' }}></div>
              <span className="fs-progress-text">Đã bán 85</span>
            </div>
          </div>

          <div className="flash-sale__card">
            <div className="flash-sale__badge">-45%</div>
            <img src="https://picsum.photos/seed/sale2/200/200" alt="Smartwatch" />
            <h4 className="fs-name">Đồng hồ Apple Watch S8</h4>
            <div className="fs-price">
              <span className="fs-new-price">8.990.000₫</span>
              <span className="fs-old-price">12.990.000₫</span>
            </div>
            <div className="fs-progress">
              <div className="fs-progress-bar" style={{ width: '50%' }}></div>
              <span className="fs-progress-text">Đã bán 50</span>
            </div>
          </div>

          <div className="flash-sale__card">
            <div className="flash-sale__badge">-20%</div>
            <img src="https://picsum.photos/seed/sale3/200/200" alt="Loa Bluetooth" />
            <h4 className="fs-name">Loa Marshall Stanmore III</h4>
            <div className="fs-price">
              <span className="fs-new-price">7.590.000₫</span>
              <span className="fs-old-price">9.500.000₫</span>
            </div>
            <div className="fs-progress">
              <div className="fs-progress-bar-fire" style={{ width: '95%' }}></div>
              <span className="fs-progress-text">Sắp hết hàng</span>
            </div>
          </div>
          
          <div className="flash-sale__card">
            <div className="flash-sale__badge">-50%</div>
            <img src="https://picsum.photos/seed/sale4/200/200" alt="Chuột gaming" />
            <h4 className="fs-name">Chuột Razer DeathAdder V2</h4>
            <div className="fs-price">
              <span className="fs-new-price">1.190.000₫</span>
              <span className="fs-old-price">2.400.000₫</span>
            </div>
            <div className="fs-progress">
              <div className="fs-progress-bar" style={{ width: '12%' }}></div>
              <span className="fs-progress-text">Vừa mở bán</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
