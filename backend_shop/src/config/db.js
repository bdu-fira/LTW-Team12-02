// config/db.js
import mysql from 'mysql2/promise';
import 'dotenv/config'; // Tự động nạp các biến từ file .env

// Tạo một hồ chứa (pool) các kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // Tối đa 10 kết nối chạy song song
    queueLimit: 0
});

// Đoạn code nhỏ để tự động kiểm tra xem kết nối có thành công không khi server chạy
pool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối Database MySQL thành công!');
        connection.release(); // Trả kết nối lại cho pool sau khi test xong
    })
    .catch(error => {
        console.error('❌ Lỗi kết nối MySQL:', error.message);
    });

export default pool;