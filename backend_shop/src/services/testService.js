// services/testService.js

//export const getStatusMessage = () => {
// Tạm thời chưa gọi Database, chỉ trả về một chuỗi string
return "Hệ thống hoạt động bình thường! (Tin nhắn này được gửi từ Service)";
//};

import db from '../config/db.js';

export const getStatusMessage = async() => {
    const [rows] = await db.query('SELECT message FROM status WHERE id = 1');
    return rows[0].message;
};