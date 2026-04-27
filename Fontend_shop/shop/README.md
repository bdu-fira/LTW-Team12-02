# React Shop (Vite)

Trang web bán hàng mẫu bằng **React + Vite**, giao diện tiếng Việt.

## ✅ Tính năng

- Danh sách sản phẩm với hình ảnh và giá
- Giỏ hàng có thể tăng/giảm số lượng
- Giỏ hàng lưu bên trong **localStorage**
- Responsive hiển thị tốt trên desktop + mobile

## 🚀 Chạy trên máy

```bash
cd shop
npm install
npm run dev
```

Mở trình duyệt tới địa chỉ được hiện trong terminal (thường là `http://cio:5173`).

## 📡 Chạy API server (MySQL)

Project đã có một API server nhỏ dùng **Express + MySQL** để lưu sản phẩm. Để chạy được, bạn cần:

1. Cài MySQL và tạo database (mặc định là `shop`).
2. Copy `./.env.example` thành `./.env` và điền thông tin kết nối. Bạn có thể dùng connection string (ví dụ `mysql://user:pass@host:port/db`) bằng cách set `DATABASE_URL` hoặc `MYSQL_URL`.
3. Chạy:

```bash
npm run server
```

Hoặc chạy đồng thời frontend + backend:

```bash
npm run start
```

Sau khi server chạy, frontend sẽ gọi API tại `http://localhost:4000/api/products` để lấy và thêm sản phẩm.

## 🧪 Build sản phẩm

```bash
npm run build
```

Kết quả build nằm trong thư mục `dist/`.

## 🧩 Cấu trúc project

- `src/App.jsx` – giao diện chính và logic giỏ hàng
- `src/components/Cart.jsx` – panel giỏ hàng
- `src/components/ProductCard.jsx` – card sản phẩm
- `src/data/products.js` – dữ liệu sản phẩm mẫu
- `src/hooks/useLocalStorage.js` – hook lưu trạng thái vào localStorage
"# LTW-Team12-02" 
