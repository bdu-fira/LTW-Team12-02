# Hệ thống Bán hàng LTW-Team12-02

Dự án lập trình Web bao gồm cả **Frontend (React + Vite)** và **Backend (Node.js + Express + MySQL)**.

## 📂 Máy chủ Backend (Node.js & MySQL)

Phụ trách xử lý dữ liệu, chứng thực và cung cấp API.

### ⚙️ Yêu cầu & Cài đặt
1. Cài đặt các thư viện Node.js:
   ```bash
   cd backend_shop
   npm install
   ```
2. Cấu hình Cơ sở dữ liệu:
   - Import dữ liệu vào MySQL (tùy chọn theo cấu hình nhóm).
   - Thiết lập cấu hình cơ sở dữ liệu bên trong logic hệ thống (`src/config/`).
3. Chạy Server:
   ```bash
   npm run dev      # Hoặc: node server.js
   ```
   > 🔴 Server mặc định chạy tại `http://localhost:5000`

## 🎨 Trình duyệt Frontend (React + Vite)

Giao diện mua sắm hiển thị cho Khách hàng và bộ máy Quản lý.

### ⚙️ Yêu cầu & Cài đặt
1. Cài đặt các module cho React:
   ```bash
   cd Fontend_shop/shop
   npm install
   ```
2. Chạy ứng dụng Frontend:
   ```bash
   npm run dev
   ```
   > 🟢 Trình duyệt sẽ mở tại `http://localhost:5173`

## 🧩 Cấu trúc Project Chính

- `backend_shop/`
  - `src/controllers/` – Các hàm xử lý API
  - `src/router/` – Định tuyến API (Auth, Product, Order, Review)
  - `src/services/` – Gọi CSDL, tính toán dữ liệu
- `Fontend_shop/shop/`
  - `src/components/` – Các module giao diện (Hero, FlashSale, Footer, Reviews...)
  - `src/data/` – Dữ liệu tĩnh hoặc hook tùy chỉnh
  - `src/App.jsx` – Cấu trúc chính của giao diện

## 📝 Chú ý
Toàn bộ mã nguồn đã được tách biệt giữa Backend và Frontend để tiện phát triển và tích hợp với cơ sở dữ liệu. Vui lòng chạy 2 terminal song song khi cần tương tác API.
