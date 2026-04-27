// routes/testRoutes.js
import express from 'express';
import { checkStatus } from '../controllers/testController.js';

const router = express.Router();

// Khi user truy cập [GET] /ping, sẽ chạy hàm checkStatus trong Controller
router.get('/ping', checkStatus);

export default router;