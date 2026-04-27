import orderService from '../services/orderService.js';

const createOrder = async (req, res) => {
    try {
        const orderId = await orderService.createOrder(req.body);
        res.status(201).json({ id: orderId, message: "Đơn hàng đã được tạo" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    createOrder
};
