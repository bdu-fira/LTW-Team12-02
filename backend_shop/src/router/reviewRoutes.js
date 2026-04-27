import express from 'express';
import reviewController from '../controllers/reviewController.js';

const router = express.Router();

router.get('/:productId', reviewController.getReviews);
router.post('/', reviewController.createReview);

export default router;
