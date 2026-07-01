import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Sparkles, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usersApi, postsApi } from '../api';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import PostCard from '../components/feed/PostCard';
import { Spinner, EmptyState } from '../components/common/index';
import { VerifiedBadge } from '../components/common/index';
import { formatCount } from '../utils';
import { Link } from 'react-router-dom';

const TABS = [
  { key: 'trending', icon: TrendingUp, label: 'Trending' },
  { key: 'people', icon: Users, label: 'People' },
];

export default function ExplorePage() {
  const { toggleFollow } = useApp();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('trending');
  const [trending, setTrending] = useState([]);
  const [people, setPeople] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ posts }, { users }] = await Promise.all([
          postsApi.getTrending(),
          usersApi.search(''),
        ]);
        setTrending(posts);
        setPeople(users);
      } catch (err) {
        console.error('Failed to load explore data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!query) { setSearchResults([]); return; }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const { users } = await usersApi.search(query);
        setSearchResults(users);
      } catch (err) {
        console.error('Search failed:', err.message);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleFollow = useCallback(async (userId, listSetter, list) => {
    try {
      const result = await toggleFollow(userId);
      listSetter(list.map(u => u.id === userId
        ? { ...u, isFollowing: result.isFollowing, requestStatus: result.requestStatus, followersCount: result.followersCount }
        : u
      ));
    } catch (err) {
      console.error('Failed to toggle follow:', err.message);
    }
  }, [toggleFollow]);

  const trendingTags = [
    { tag: 'webdev', count: 48200 }, { tag: 'AI', count: 92100 }, { tag: 'design', count: 37400 },
    { tag: 'startup', count: 61000 }, { tag: 'programming', count: 55800 }, { tag: 'remotework', count: 29300 },
    { tag: 'frontend', count: 43700 }, { tag: 'career', count: 31200 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 glass border-b border-border-base px-5 py-4">
        <h1 className="text-lg font-semibold text-text-primary mb-3">Explore</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search people..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full neu-inset rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      {!query && (
        <div className="flex border-b border-border-base px-5">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all mr-2
                ${tab === t.key ? 'text-text-primary border-brand' : 'text-text-muted border-transparent hover:text-text-secondary'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : query ? (
        <div>
          <p className="text-text-muted text-xs px-5 py-3">
            {searching ? 'Searching...' : `${searchResults.length} results for "${query}"`}
          </p>
          {!searching && searchResults.length > 0 ? searchResults.map(u => (
            <UserRow key={u.id} user={u} onFollow={() => handleFollow(u.id, setSearchResults, searchResults)} />
          )) : !searching && (
            <EmptyState icon={Search} title={`No results for "${query}"`} />
          )}
        </div>
      ) : tab === 'trending' ? (
        <div>
          {/* Trending Tags */}
          <div className="px-5 py-4 border-b border-border-base">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-sm font-semibold text-text-primary">Trending Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(({ tag, count }) => (
                <button key={tag}
                  className="glass px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary hover:border-violet-500/40 border border-border-base transition-all">
                  #{tag} <span className="text-text-muted ml-1">{formatCount(count)}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Trending Posts */}
          <div>
            {trending.length > 0 ? trending.map(post => <PostCard key={post.id} post={post} />) : (
              <EmptyState icon={TrendingUp} title="No trending posts yet" subtitle="Be the first to post something popular" />
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="px-5 py-3 border-b border-border-base">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Suggested Profiles</p>
          </div>
          {people.length > 0 ? people.map(u => (
            <UserRow key={u.id} user={u} onFollow={() => handleFollow(u.id, setPeople, people)} />
          )) : (
            <EmptyState icon={Users} title="No users found" />
          )}
        </div>
      )}
    </div>
  );
}

function UserRow({ user: u, onFollow }) {
  const label = u.isFollowing ? 'Following' : u.requestStatus === 'pending' ? 'Requested' : 'Follow';
  const variant = u.isFollowing || u.requestStatus === 'pending' ? 'following' : 'follow';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex items-center gap-3 px-5 py-4 border-b border-border-base hover:bg-surface-3/50 transition-colors">
      <Link to={`/user/${u.username}`}>
        <Avatar src={u.avatar} alt={u.name} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link to={`/user/${u.username}`} className="font-semibold text-sm text-text-primary hover:underline truncate">{u.name}</Link>
          {u.verified && <VerifiedBadge size={13} />}
          {u.isPrivate && <Lock size={11} className="text-text-muted flex-shrink-0" />}
        </div>
        <p className="text-xs text-text-muted">@{u.username} · {formatCount(u.followersCount)} followers</p>
        {u.bio && <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{u.bio}</p>}
      </div>
      <Button variant={variant} size="sm" onClick={onFollow}>
        {label}
      </Button>
    </motion.div>
  );
}
