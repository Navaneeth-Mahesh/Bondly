import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { validateImageField } from '../utils/validateImage.js';
import { checkPostVisibility } from '../utils/postVisibility.js';

// Returns a Mongo query fragment excluding posts authored by private accounts
// that the current viewer doesn't follow (and isn't the author of).
// Used by the public feed/trending endpoints — full-account browsing.
const buildVisibilityFilter = async (viewerId) => {
  const privateAuthors = await User.find({ 'preferences.privateAccount': true }).distinct('_id');
  if (privateAuthors.length === 0) return {};

  const visiblePrivateAuthorIds = viewerId
    ? privateAuthors.filter((id) =>
        id.equals(viewerId) // viewer's own private posts are always visible to them
      )
    : [];

  // Authors the viewer follows, among the private ones, are also visible
  let followedPrivateIds = [];
  if (viewerId) {
    const viewer = await User.findById(viewerId).select('following');
    const followingSet = new Set((viewer?.following || []).map((id) => id.toString()));
    followedPrivateIds = privateAuthors.filter((id) => followingSet.has(id.toString()));
  }

  const allowedPrivateIds = [...visiblePrivateAuthorIds, ...followedPrivateIds];
  const blockedPrivateIds = privateAuthors.filter(
    (id) => !allowedPrivateIds.some((allowed) => allowed.equals(id))
  );

  return blockedPrivateIds.length > 0 ? { author: { $nin: blockedPrivateIds } } : {};
};

const serializePost = (post, userId) => {
  const obj = post.toObject ? post.toObject() : post;
  return {
    id: obj._id,
    author: obj.author && {
      id: obj.author._id,
      name: obj.author.name,
      username: obj.author.username,
      avatar: obj.author.avatar,
      verified: obj.author.verified,
    },
    content: obj.content,
    image: obj.image,
    tags: obj.tags,
    likesCount: obj.likes?.length || 0,
    isLiked: userId ? obj.likes?.some((id) => id.toString() === userId.toString()) : false,
    commentsCount: obj.commentsCount,
    sharesCount: obj.sharesCount,
    createdAt: obj.createdAt,
  };
};

// @route GET /api/posts?page=&limit=
export const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const visibilityFilter = await buildVisibilityFilter(req.user?._id);

    const posts = await Post.find(visibilityFilter)
      .populate('author', 'name username avatar verified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments(visibilityFilter);
    res.json({
      success: true,
      posts: posts.map((p) => serializePost(p, req.user?._id)),
      hasMore: page * limit < total,
      total,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/posts/trending
export const getTrending = async (req, res, next) => {
  try {
    const visibilityFilter = await buildVisibilityFilter(req.user?._id);
    const posts = await Post.find(visibilityFilter)
      .populate('author', 'name username avatar verified')
      .sort({ likes: -1, createdAt: -1 })
      .limit(15);
    res.json({ success: true, posts: posts.map((p) => serializePost(p, req.user?._id)) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/posts/user/:userId
export const getUserPosts = async (req, res, next) => {
  try {
    const author = await User.findById(req.params.userId).select('preferences followers');
    if (!author) return res.status(404).json({ success: false, message: 'User not found' });

    const isOwnProfile = req.user ? author._id.equals(req.user._id) : false;
    const isFollowing = req.user ? author.followers.some((id) => id.equals(req.user._id)) : false;
    if (author.preferences?.privateAccount && !isOwnProfile && !isFollowing) {
      return res.status(403).json({ success: false, message: 'This account is private' });
    }

    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name username avatar verified')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts: posts.map((p) => serializePost(p, req.user?._id)) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/posts/saved
export const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'author', select: 'name username avatar verified' },
    });
    const posts = user.savedPosts.filter(Boolean);
    res.json({ success: true, posts: posts.map((p) => serializePost(p, req.user._id)) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/posts/liked
export const getLikedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ likes: req.user._id })
      .populate('author', 'name username avatar verified')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts: posts.map((p) => serializePost(p, req.user._id)) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts
export const createPost = async (req, res, next) => {
  try {
    const { content, image, tags } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ success: false, message: 'Post is too long (max 2000 chars)' });
    }
    const imageError = validateImageField(image, 'Post image');
    if (imageError) return res.status(400).json({ success: false, message: imageError });

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      image: image || '',
      tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
    });
    await post.populate('author', 'name username avatar verified');

    res.status(201).json({ success: true, post: serializePost(post, req.user._id) });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/posts/:id
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:id/like
export const toggleLike = async (req, res, next) => {
  try {
    const { canView, post } = await checkPostVisibility(req.params.id, req.user._id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'This account is private' });

    const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));
    if (alreadyLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    if (!alreadyLiked && !post.author.equals(req.user._id)) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id,
        message: 'liked your post',
      });
    }

    res.json({ success: true, isLiked: !alreadyLiked, likesCount: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:id/save
export const toggleSave = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const user = req.user;
    const alreadySaved = user.savedPosts.some((id) => id.equals(post._id));
    if (alreadySaved) {
      user.savedPosts.pull(post._id);
    } else {
      user.savedPosts.push(post._id);
    }
    await user.save();

    res.json({ success: true, isSaved: !alreadySaved });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:id/share
export const sharePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, sharesCount: post.sharesCount });
  } catch (err) {
    next(err);
  }
};
