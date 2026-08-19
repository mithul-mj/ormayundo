import express from 'express';
import { createRecallItem, getDueItems, reviewRecallItem, deleteRecallItem } from '../controllers/recallController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createRecallSchema, reviewRecallSchema } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createRecallSchema), createRecallItem);
router.get('/due', getDueItems);
router.post('/:id/review', validate(reviewRecallSchema), reviewRecallItem);
router.delete('/:id', deleteRecallItem);

export default router;
