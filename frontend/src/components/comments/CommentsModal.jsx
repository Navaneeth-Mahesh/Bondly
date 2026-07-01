import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import { VerifiedBadge } from '../common/index';
import { Spinner } from '../common/index';
import EmojiPickerButton from '../common/EmojiPickerButton';
import { useAuth } from '../../context/AuthContext';
import { postsApi, commentsApi } from '../../api';
import { timeAgo, formatCount } from '../../utils';

export default function CommentsModal({ isOpen, onClose, post }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    if (!post?.id) return;
    setLoading(true);
    try {
      const { comments: data } = await postsApi.getComments(post.id);
      setComments(data);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [post?.id]);

  useEffect(() => {
    if (isOpen) {
      loadComments();
      setNewComment('');
      setReplyTo(null);
      setError('');
    }
  }, [isOpen, loadComments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const { comment } = await postsApi.addComment(post.id, {
        content: newComment.trim(),
        parentComment: replyTo,
      });
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) => (c.id === replyTo ? { ...c, replies: [...c.replies, comment] } : c))
        );
        setExpandedReplies((prev) => new Set(prev).add(replyTo));
      } else {
        setComments((prev) => [comment, ...prev]);
      }
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId, isReply, parentId) => {
    try {
      await commentsApi.remove(commentId);
      if (isReply) {
        setComments((prev) =>
          prev.map((c) => (c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) } : c))
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId, isReply, parentId) => {
    // optimistic
    const apply = (c) =>
      c.id === commentId ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 } : c;
    if (isReply) {
      setComments((prev) => prev.map((c) => (c.id === parentId ? { ...c, replies: c.replies.map(apply) } : c)));
    } else {
      setComments((prev) => prev.map(apply));
    }
    try {
      await commentsApi.toggleLike(commentId);
    } catch (err) {
      console.error('Failed to like comment:', err.message);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comments${post ? ` (${post.commentsCount})` : ''}`} size="md">
      {/* Original Post Preview */}
      {post && (
        <div className="mb-5 pb-5 border-b border-border-base">
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={post.author?.avatar} alt={post.author?.name} size="xs" />
            <span className="text-sm font-medium text-text-secondary">{post.author?.name}</span>
            {post.author?.verified && <VerifiedBadge size={12} />}
          </div>
          <p className="text-text-secondary text-sm line-clamp-3">{post.content}</p>
        </div>
      )}

      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs text-violet-400">Replying to comment</span>
          <button onClick={() => setReplyTo(null)} className="text-xs text-text-muted hover:text-text-primary">Cancel</button>
        </div>
      )}

      {/* Add Comment */}
      <div className="flex gap-3 mb-6">
        <Avatar src={user?.avatar} alt={user?.name} size="sm" />
        <div className="flex-1 flex items-end gap-2 neu-inset rounded-2xl px-3 py-2">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }}}
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
            rows={1}
            disabled={submitting}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted resize-none outline-none leading-relaxed disabled:opacity-50"
          />
          <EmojiPickerButton onSelect={(emoji) => setNewComment((c) => c + emoji)} placement="top"
            className="text-text-muted hover:text-amber-400 transition-colors flex-shrink-0 mb-0.5" iconSize={17} />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
            className="text-violet-400 disabled:text-text-muted hover:text-violet-300 transition-colors flex-shrink-0 mb-0.5"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs text-center py-2 mb-4 glass rounded-xl border border-red-500/20">{error}</p>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence initial={false}>
            {comments.map(comment => (
              <motion.div key={comment.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex gap-3">
                  <Avatar src={comment.author?.avatar} alt={comment.author?.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="neu-flat rounded-2xl px-3 py-2.5 mb-1.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-semibold text-text-primary">{comment.author?.name}</span>
                        {comment.author?.verified && <VerifiedBadge size={12} />}
                        <span className="text-text-muted text-xs ml-auto">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-text-primary/85 leading-relaxed">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                      <button
                        onClick={() => handleLikeComment(comment.id, false)}
                        className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked ? 'text-rose-400' : 'text-text-muted hover:text-rose-400'}`}
                      >
                        <Heart size={12} fill={comment.isLiked ? 'currentColor' : 'none'} /> {formatCount(comment.likesCount)}
                      </button>
                      <button onClick={() => setReplyTo(comment.id)} className="text-xs text-text-muted hover:text-violet-400 transition-colors">
                        Reply
                      </button>
                      {comment.author?.id === user?.id && (
                        <button onClick={() => handleDelete(comment.id, false)}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors">
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                      {comment.replies?.length > 0 && (
                        <button onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-violet-400 transition-colors ml-auto">
                          {expandedReplies.has(comment.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                      )}
                    </div>

                    {/* Nested Replies */}
                    <AnimatePresence>
                      {expandedReplies.has(comment.id) && comment.replies?.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-3 pl-4 border-l border-border-base">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="flex gap-2.5">
                              <Avatar src={reply.author?.avatar} alt={reply.author?.name} size="xs" />
                              <div className="flex-1">
                                <div className="neu-flat rounded-2xl px-3 py-2">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-xs font-semibold text-text-primary">{reply.author?.name}</span>
                                    <span className="text-text-muted text-[11px] ml-auto">{timeAgo(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-xs text-text-primary/80">{reply.content}</p>
                                </div>
                                {reply.author?.id === user?.id && (
                                  <button onClick={() => handleDelete(reply.id, true, comment.id)}
                                    className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors mt-1 px-1">
                                    <Trash2 size={10} /> Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {comments.length === 0 && (
            <p className="text-center text-text-muted text-sm py-8">No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </Modal>
  );
}
