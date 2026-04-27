import db from '../config/db.js';

const getReviewsByProductId = async (productId) => {
    const [rows] = await db.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [productId]);
    return rows;
};

const createReview = async (reviewData) => {
    const { product_id, user_name, rating, comment } = reviewData;
    const [result] = await db.query(
        'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
        [product_id, user_name, rating, comment]
    );
    return result.insertId;
};

export default {
    getReviewsByProductId,
    createReview
};
