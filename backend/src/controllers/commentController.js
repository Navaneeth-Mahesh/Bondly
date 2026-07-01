import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { checkPostVisibility } from '../utils/postVisibility.js';

const serializeComment = (c, userId) => {
  const obj = c.toObject ? c.toObject() : c;
  return {
    id: obj._id,
    postId: obj.post,
    parentComment: obj.parentComment || null,
    author: obj.author && {
      id: obj.author._id,
      name: obj.author.name,
      username: obj.author.username,
      avatar: obj.author.avatar,
      verified: obj.author.verified,
    },
    content: obj.content,
    likesCount: obj.likes?.length || 0,
    isLiked: userId ? obj.likes?.some((id) => id.toString() === userId.toString()) : false,
    createdAt: obj.createdAt,
  };
};

// @route GET /api/posts/:postId/comments
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { canView, post } = await checkPostVisibility(postId, req.user?._id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'This account is private' });

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate('author', 'name username avatar verified')
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      comments.map(async (c) => {
        const replies = await Comment.find({ parentComment: c._id })
          .populate('author', 'name username avatar verified')
          .sort({ createdAt: 1 });
        return {
          ...serializeComment(c, req.user?._id),
          replies: replies.map((r) => serializeComment(r, req.user?._id)),
        };
      })
    );

    res.json({ success: true, comments: result });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:postId/comments
export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const { canView, post } = await checkPostVisibility(postId, req.user._id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'This account is private' });

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) return res.status(404).json({ success: false, message: 'Parent comment not found' });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null,
    });
    await comment.populate('author', 'name username avatar verified');

    post.commentsCount += 1;
    await post.save();

    if (!post.author.equals(req.user._id)) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        message: 'commented on your post',
      });
    }

    res.status(201).json({ success: true, comment: { ...serializeComment(comment, req.user._id), replies: [] } });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/comments/:id
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
    }

    const post = await Post.findById(comment.post);
    const childCount = await Comment.countDocuments({ parentComment: comment._id });
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1 - childCount);
      await post.save();
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/comments/:id/like
export const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const alreadyLiked = comment.likes.some((id) => id.equals(req.user._id));
    if (alreadyLiked) comment.likes.pull(req.user._id);
    else comment.likes.push(req.user._id);
    await comment.save();

    res.json({ success: true, isLiked: !alreadyLiked, likesCount: comment.likes.length });
  } catch (err) {
    next(err);
  }
};
