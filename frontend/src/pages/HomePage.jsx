import { useState, useEffect, useRef } from 'react';
import { Image, PenSquare, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/feed/PostCard';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { Spinner, EmptyState } from '../components/common/index';
import CreatePostModal from '../components/feed/CreatePostModal';
import { usersApi } from '../api';
import { formatCount } from '../utils';
import { Link } from 'react-router-dom';
import { VerifiedBadge } from '../components/common/index';

export default function HomePage() {
  const { posts, feedLoading, hasMore, loadMore, toggleFollow } = useApp();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [suggested, setSuggested] = useState([]);
  const [followState, setFollowState] = useState({});
  const loaderRef = useRef(null);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !feedLoading) {
        loadMore();
      }
    }, { threshold: 0.5 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, feedLoading, loadMore]);

  // Load suggested users once
  useEffect(() => {
    usersApi.search('').then(({ users }) => {
      setSuggested(users.slice(0, 5));
      const initial = {};
      users.forEach(u => { initial[u.id] = { isFollowing: u.isFollowing, requestStatus: u.requestStatus }; });
      setFollowState(initial);
    }).catch(() => {});
  }, []);

  const handleFollow = async (userId) => {
    try {
      const result = await toggleFollow(userId);
      setFollowState(prev => ({ ...prev, [userId]: { isFollowing: result.isFollowing, requestStatus: result.requestStatus } }));
    } catch (err) {
      console.error('Failed to toggle follow:', err.message);
    }
  };

  return (
    <div className="flex gap-0 max-w-5xl mx-auto">
      {/* Feed */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-30 glass border-b border-border-base px-5 py-4">
          <h1 className="text-lg font-semibold text-text-primary">Home</h1>
        </div>

        {/* Create Post (inline) */}
        <div className="neu-raised rounded-[26px] mx-3 mt-3 sm:mx-4 p-5 cursor-pointer" onClick={() => setCreateOpen(true)}>
          <div className="flex gap-3">
            <Avatar src={user?.avatar} alt={user?.name} size="md" />
            <div className="flex-1">
              <div className="neu-inset rounded-2xl px-4 py-3 text-text-muted text-sm mb-3">
                What's on your mind?
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); setCreateOpen(true); }}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-violet-400 hover:bg-violet-500/10 px-3 py-1.5 rounded-lg transition-colors">
                  <Image size={15} /> Photo
                </button>
                <Button size="sm" className="ml-auto" onClick={e => { e.stopPropagation(); setCreateOpen(true); }}
                  icon={<PenSquare size={14} />}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 && !feedLoading ? (
          <EmptyState
            icon={Sparkles}
            title="Your feed is empty"
            subtitle="Follow people or create your first post to get started"
            action={<Button onClick={() => setCreateOpen(true)} icon={<PenSquare size={14} />}>Create Post</Button>}
          />
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}

        {/* Loader */}
        <div ref={loaderRef} className="flex items-center justify-center py-8">
          {feedLoading ? <Spinner /> : (!hasMore && posts.length > 0) && (
            <p className="text-text-muted text-sm">You're all caught up ✓</p>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:flex flex-col w-80 flex-shrink-0 p-4 gap-4 sticky top-0 h-screen overflow-y-auto">
        {/* Suggested */}
        <div className="neu-raised rounded-[26px] p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-text-primary text-sm">Suggested for you</span>
            <Link to="/explore" className="text-brand text-xs hover:text-violet-400 transition-colors">See all</Link>
          </div>
          <div className="space-y-3">
            {suggested.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <Link to={`/user/${u.username}`}>
                  <Avatar src={u.avatar} alt={u.name} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Link to={`/user/${u.username}`} className="text-sm font-medium text-text-primary truncate hover:underline max-w-[100px]">{u.name}</Link>
                    {u.verified && <VerifiedBadge size={12} />}
                  </div>
                  <p className="text-xs text-text-muted">{formatCount(u.followersCount)} followers</p>
                </div>
                <Button
                  variant={followState[u.id]?.isFollowing || followState[u.id]?.requestStatus === 'pending' ? 'following' : 'follow'}
                  size="sm"
                  onClick={() => handleFollow(u.id)}
                >
                  {followState[u.id]?.isFollowing ? 'Following' : followState[u.id]?.requestStatus === 'pending' ? 'Requested' : 'Follow'}
                </Button>
              </div>
            ))}
            {suggested.length === 0 && <p className="text-text-muted text-xs">No suggestions yet</p>}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="neu-raised rounded-[26px] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-violet-400" />
            <span className="font-semibold text-text-primary text-sm">Trending</span>
          </div>
          {['webdev', 'AI', 'design', 'startup', 'programming', 'remotework', 'frontend', 'career'].map((tag, i) => (
            <div key={tag} className="flex items-center justify-between py-2 group cursor-pointer hover:bg-surface-3 rounded-lg px-1 transition-colors">
              <div>
                <p className="text-xs text-text-muted">#{i + 1} · Technology</p>
                <p className="text-sm font-medium text-text-primary group-hover:text-violet-300 transition-colors">#{tag}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreatePostModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
