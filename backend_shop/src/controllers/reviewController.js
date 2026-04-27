import reviewService from '../services/reviewService.js';

const getReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByProductId(req.params.productId);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createReview = async (req, res) => {
    try {
        const reviewId = await reviewService.createReview(req.body);
        res.status(201).json({ id: reviewId, message: "Đánh giá đã được gửi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    getReviews,
    createReview
};
