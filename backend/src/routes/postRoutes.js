import express from 'express';
import {
  getFeed, getTrending, getUserPosts, getSavedPosts, getLikedPosts,
  createPost, deletePost, toggleLike, toggleSave, sharePost,
} from '../controllers/postController.js';
import { getComments, addComment } from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getFeed);
router.get('/trending', optionalAuth, getTrending);
router.get('/saved', protect, getSavedPosts);
router.get('/liked', protect, getLikedPosts);
router.get('/user/:userId', optionalAuth, getUserPosts);

router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSave);
router.post('/:id/share', protect, sharePost);

router.get('/:postId/comments', optionalAuth, getComments);
router.post('/:postId/comments', protect, addComment);

export default router;
