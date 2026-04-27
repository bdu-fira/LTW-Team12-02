// index.js
import express from 'express';
import db from './src/config/db.js';
import router from './src/router/userroutes.js';
const app = express();
const PORT = 3000;

app.use(express.json());

// Gắn nhóm route test vào đường dẫn gốc là /api/test
app.use('/api/users', router);

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});