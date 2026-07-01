import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { formatCount } from '../../utils';
import PostDetailModal from './PostDetailModal';

export default function PostGrid({ posts, onDeleted }) {
  const [activePost, setActivePost] = useState(null);

  if (posts.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
        {posts.map((post) => (
          <motion.button
            key={post.id}
            onClick={() => setActivePost(post)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-surface-3 group"
          >
            {post.image ? (
              <img src={post.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-3">
                <p className="text-text-secondary text-xs leading-snug line-clamp-5 text-left">{post.content}</p>
              </div>
            )}
            {/* Hover overlay with stats */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
              <span className="flex items-center gap-1 text-white text-sm font-semibold">
                <Heart size={16} fill="white" /> {formatCount(post.likesCount)}
              </span>
              <span className="flex items-center gap-1 text-white text-sm font-semibold">
                <MessageCircle size={16} fill="white" /> {formatCount(post.commentsCount)}
              </span>
            </div>
            {post.image && (
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-0">
                <ImageIcon size={14} className="text-white drop-shadow" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <PostDetailModal post={activePost} isOpen={!!activePost} onClose={() => setActivePost(null)} onDeleted={(id) => { onDeleted?.(id); setActivePost(null); }} />
    </>
  );
}
