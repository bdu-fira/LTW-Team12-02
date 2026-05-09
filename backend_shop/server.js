// index.js
import express from 'express';
import db from './src/config/db.js';
import router from './src/router/userroutes.js';
import initDatabase from './src/config/init_db.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Gắn nhóm route user vào đường dẫn gốc là /api/users
app.use('/api/users', router);

// Khởi tạo Database rồi mới chạy Server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
});