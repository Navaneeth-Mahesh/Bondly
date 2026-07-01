import express from 'express';
import { deleteComment, toggleCommentLike } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;
