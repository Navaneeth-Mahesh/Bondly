import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import FollowRequest from '../models/FollowRequest.js';
import { validateImageField } from '../utils/validateImage.js';

// @route GET /api/users/:username
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isOwnProfile = req.user ? user._id.equals(req.user._id) : false;
    const isFollowing = req.user ? user.followers.some((id) => id.equals(req.user._id)) : false;
    const isPrivate = !!user.preferences?.privateAccount;
    const canViewContent = isOwnProfile || !isPrivate || isFollowing;

    let requestStatus = null; // 'pending' | null — whether current user has a pending request to this account
    if (req.user && !isOwnProfile && !isFollowing) {
      const existingRequest = await FollowRequest.findOne({ from: req.user._id, to: user._id, status: 'pending' });
      if (existingRequest) requestStatus = 'pending';
    }

    const postsCount = canViewContent ? await Post.countDocuments({ author: user._id }) : 0;

    res.json({
      success: true,
      user: {
        ...user.toSafeObject(),
        postsCount,
        isFollowing,
        isOwnProfile,
        isPrivate,
        canViewContent,
        requestStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/me
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'avatar', 'cover', 'location', 'website'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const avatarError = validateImageField(updates.avatar, 'Profile picture');
    if (avatarError) return res.status(400).json({ success: false, message: avatarError });
    const coverError = validateImageField(updates.cover, 'Banner image');
    if (coverError) return res.status(400).json({ success: false, message: coverError });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/:id/follow
// For public accounts: follows/unfollows immediately, as before.
// For private accounts: creates a pending FollowRequest instead of following directly;
// calling again while a request is pending cancels that request.
export const toggleFollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const alreadyFollowing = target.followers.some((id) => id.equals(req.user._id));

    // Already following -> this action always means "unfollow", regardless of privacy
    if (alreadyFollowing) {
      target.followers.pull(req.user._id);
      req.user.following.pull(target._id);
      await target.save();
      await req.user.save();
      return res.json({ success: true, isFollowing: false, requestStatus: null, followersCount: target.followers.length });
    }

    // Not following yet, and target is private -> manage a follow request instead
    if (target.preferences?.privateAccount) {
      const existingRequest = await FollowRequest.findOne({ from: req.user._id, to: target._id });

      if (existingRequest && existingRequest.status === 'pending') {
        // Toggling again while pending = cancel the request
        await existingRequest.deleteOne();
        return res.json({ success: true, isFollowing: false, requestStatus: null, followersCount: target.followers.length });
      }

      if (existingRequest) {
        existingRequest.status = 'pending';
        await existingRequest.save();
      } else {
        await FollowRequest.create({ from: req.user._id, to: target._id, status: 'pending' });
      }

      await Notification.create({
        recipient: target._id,
        sender: req.user._id,
        type: 'follow_request',
        message: 'requested to follow you',
      });

      return res.json({ success: true, isFollowing: false, requestStatus: 'pending', followersCount: target.followers.length });
    }

    // Not following yet, target is public -> follow immediately
    target.followers.push(req.user._id);
    req.user.following.push(target._id);
    await target.save();
    await req.user.save();

    await Notification.create({
      recipient: target._id,
      sender: req.user._id,
      type: 'follow',
      message: 'started following you',
    });

    res.json({ success: true, isFollowing: true, requestStatus: null, followersCount: target.followers.length });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/me/follow-requests — pending requests TO the current user
export const getFollowRequests = async (req, res, next) => {
  try {
    const requests = await FollowRequest.find({ to: req.user._id, status: 'pending' })
      .populate('from', 'name username avatar verified')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: requests.map((r) => ({
        id: r._id,
        from: r.from && {
          id: r.from._id,
          name: r.from.name,
          username: r.from.username,
          avatar: r.from.avatar,
          verified: r.from.verified,
        },
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/follow-requests/:id/accept
export const acceptFollowRequest = async (req, res, next) => {
  try {
    const request = await FollowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (!request.to.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this request' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already resolved' });
    }

    request.status = 'accepted';
    await request.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { followers: request.from } });
    await User.findByIdAndUpdate(request.from, { $addToSet: { following: req.user._id } });

    await Notification.create({
      recipient: request.from,
      sender: req.user._id,
      type: 'follow_accept',
      message: 'accepted your follow request',
    });

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/follow-requests/:id/decline
export const declineFollowRequest = async (req, res, next) => {
  try {
    const request = await FollowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (!request.to.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this request' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already resolved' });
    }

    request.status = 'declined';
    await request.save();

    res.json({ success: true, message: 'Follow request declined' });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/me/preferences
export const updatePreferences = async (req, res, next) => {
  try {
    const allowed = [
      'theme', 'privateAccount', 'showActivityStatus', 'allowTagging', 'allowMessages',
      'reduceMotion', 'notifyLikes', 'notifyComments', 'notifyFollows', 'notifyMentions',
      'emailNotifications', 'pushNotifications',
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[`preferences.${field}`] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/me/password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/users/me
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password confirmation is required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const userId = user._id;

    // Clean up references and owned content across the app
    await Promise.all([
      User.updateMany({ followers: userId }, { $pull: { followers: userId } }),
      User.updateMany({ following: userId }, { $pull: { following: userId } }),
      User.updateMany({}, { $pull: { savedPosts: { $in: await Post.find({ author: userId }).distinct('_id') } } }),
      Post.deleteMany({ author: userId }),
      Comment.deleteMany({ author: userId }),
      Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
    ]);

    await user.deleteOne();

    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/:id/followers
export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name username avatar verified followers');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isOwnProfile = req.user ? user._id.equals(req.user._id) : false;
    const isFollowing = req.user ? user.followers.some((f) => f._id.equals(req.user._id)) : false;
    if (user.preferences?.privateAccount && !isOwnProfile && !isFollowing) {
      return res.status(403).json({ success: false, message: 'This account is private' });
    }

    const list = user.followers.map((f) => ({
      id: f._id,
      name: f.name,
      username: f.username,
      avatar: f.avatar,
      verified: f.verified,
      isFollowing: req.user ? f.followers.some((id) => id.equals(req.user._id)) : false,
    }));
    res.json({ success: true, users: list });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/:id/following
export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name username avatar verified followers');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isOwnProfile = req.user ? user._id.equals(req.user._id) : false;
    const isFollowing = req.user ? user.followers.some((id) => id.equals(req.user._id)) : false;
    if (user.preferences?.privateAccount && !isOwnProfile && !isFollowing) {
      return res.status(403).json({ success: false, message: 'This account is private' });
    }

    const list = user.following.map((f) => ({
      id: f._id,
      name: f.name,
      username: f.username,
      avatar: f.avatar,
      verified: f.verified,
      isFollowing: req.user ? f.followers.some((id) => id.equals(req.user._id)) : false,
    }));
    res.json({ success: true, users: list });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users?search=&page=&limit=
export const searchUsers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { username: { $regex: search, $options: 'i' } }] }
      : {};
    if (req.user) query._id = { $ne: req.user._id };

    const users = await User.find(query)
      .sort({ followers: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    let pendingToIds = new Set();
    if (req.user) {
      const pending = await FollowRequest.find({ from: req.user._id, status: 'pending' }).select('to');
      pendingToIds = new Set(pending.map((r) => r.to.toString()));
    }

    const list = users.map((u) => ({
      ...u.toSafeObject(),
      isFollowing: req.user ? u.followers.some((id) => id.equals(req.user._id)) : false,
      isPrivate: !!u.preferences?.privateAccount,
      requestStatus: pendingToIds.has(u._id.toString()) ? 'pending' : null,
    }));

    res.json({ success: true, users: list });
  } catch (err) {
    next(err);
  }
};
