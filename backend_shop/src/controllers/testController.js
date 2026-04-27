// controllers/testController.js
import * as testService from '../services/testService.js';

export const checkStatus = (req, res) => {
    // 1. Gọi Service để lấy câu thông báo
    const messageFromService = testService.getStatusMessage();

    // 2. Trả về Response
    res.status(200).json({
        success: true,
        message: messageFromService
    });
};