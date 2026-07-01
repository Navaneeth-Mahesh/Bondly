import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { VerifiedBadge } from '../common/index';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCount, timeAgo } from '../../utils';
import CommentsModal from '../comments/CommentsModal';

export default function PostCard({ post, showBorder = true, onDeleted }) {
  const { toggleLike, toggleSave, sharePost, removePost } = useApp();
  const { user } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!post || !post.author) return null;

  const isOwnPost = user && (user.id === post.author.id);

  const handleShare = (e) => {
    e.stopPropagation();
    sharePost(post.id);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved((prev) => !prev);
    toggleSave(post.id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      await removePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err.message);
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className={`p-5 rounded-[26px] neu-raised relative card-3d ${showBorder ? 'mx-3 my-2.5 sm:mx-4 sm:my-3' : ''}`}
      >
        <div className="flex gap-3">
          <Link to={`/user/${post.author.username}`} onClick={e => e.stopPropagation()}>
            <Avatar src={post.author.avatar} alt={post.author.name} size="md" />
          </Link>
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link to={`/user/${post.author.username}`}
                  className="font-semibold text-text-primary text-sm hover:underline truncate max-w-[140px] sm:max-w-none"
                  onClick={e => e.stopPropagation()}>
                  {post.author.name}
                </Link>
                {post.author.verified && <VerifiedBadge />}
                <span className="text-text-muted text-sm">·</span>
                <span className="text-text-muted text-xs flex-shrink-0">@{post.author.username}</span>
                <span className="text-text-muted text-sm">·</span>
                <span className="text-text-muted text-xs flex-shrink-0">{timeAgo(post.createdAt)}</span>
              </div>
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                  className="p-1 text-text-muted hover:text-text-secondary rounded-lg hover:bg-surface-3 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-7 z-20 neu-raised rounded-2xl py-1.5 min-w-[140px]"
                      >
                        {isOwnPost ? (
                          <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete post'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-3 transition-colors"
                          >
                            Report post
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Content */}
            <p className="text-text-primary/90 text-sm leading-relaxed whitespace-pre-line mb-3">{post.content}</p>

            {/* Image */}
            {post.image && (
              <div className="rounded-xl overflow-hidden mb-3 border border-border-base bg-surface-3">
                <img
                  src={post.image}
                  alt="post"
                  className="w-full h-auto max-h-[80vh] object-contain"
                  loading="lazy"
                />
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.map(tag => (
                  <span key={tag} className="text-violet-400 text-xs hover:text-violet-300 cursor-pointer transition-colors">#{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-1 -ml-2">
              <ActionBtn
                icon={Heart} count={post.likesCount}
                active={post.isLiked} activeColor="text-rose-400"
                activeBg="hover:bg-rose-500/10"
                onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}
                filled={post.isLiked}
              />
              <ActionBtn
                icon={MessageCircle} count={post.commentsCount}
                activeBg="hover:bg-blue-500/10" activeColor="text-blue-400"
                onClick={(e) => { e.stopPropagation(); setCommentsOpen(true); }}
              />
              <ActionBtn
                icon={Repeat2} count={post.sharesCount}
                activeBg="hover:bg-green-500/10" activeColor="text-green-400"
                onClick={handleShare}
              />
              <ActionBtn
                icon={Share2} count={null}
                activeBg="hover:bg-violet-500/10" activeColor="text-violet-400"
                onClick={handleShare}
              />
              <ActionBtn
                icon={Bookmark} count={null}
                active={isSaved} activeColor="text-violet-400"
                activeBg="hover:bg-violet-500/10"
                filled={isSaved}
                onClick={handleSave}
              />
            </div>
          </div>
        </div>

        {/* Share toast */}
        <AnimatePresence>
          {shareToast && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 neu-raised px-4 py-2 rounded-2xl text-sm text-text-primary z-50">
              Link copied! ✓
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      <CommentsModal isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} post={post} />
    </>
  );
}

function ActionBtn({ icon: Icon, count, active, activeColor, activeBg, onClick, filled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-text-muted transition-all
        hover:text-text-secondary ${activeBg} ${active ? activeColor : ''} group`}
    >
      <Icon size={17} className="transition-transform group-hover:scale-110" fill={filled ? 'currentColor' : 'none'} />
      {count != null && <span className="text-xs font-medium">{formatCount(count)}</span>}
    </motion.button>
  );
}
