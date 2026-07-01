import express from 'express';
import {
  getUserProfile, updateProfile, toggleFollow,
  getFollowers, getFollowing, searchUsers,
  updatePreferences, changePassword, deleteAccount,
  getFollowRequests, acceptFollowRequest, declineFollowRequest,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, searchUsers);
router.put('/me', protect, updateProfile);
router.put('/me/preferences', protect, updatePreferences);
router.put('/me/password', protect, changePassword);
router.delete('/me', protect, deleteAccount);
router.get('/me/follow-requests', protect, getFollowRequests);
router.post('/follow-requests/:id/accept', protect, acceptFollowRequest);
router.post('/follow-requests/:id/decline', protect, declineFollowRequest);
router.get('/:username', optionalAuth, getUserProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', optionalAuth, getFollowers);
router.get('/:id/following', optionalAuth, getFollowing);

export default router;
