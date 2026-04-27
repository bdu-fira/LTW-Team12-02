import db from '../config/db.js';

const createOrder = async (orderData) => {
    const { customer_name, phone, address, payment_method, total_amount, items } = orderData;
    
    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_name, phone, address, payment_method, total_amount) VALUES (?, ?, ?, ?, ?)',
            [customer_name, phone, address, payment_method, total_amount]
        );
        
        const orderId = orderResult.insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await connection.commit();
        return orderId;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

export default {
    createOrder
};
