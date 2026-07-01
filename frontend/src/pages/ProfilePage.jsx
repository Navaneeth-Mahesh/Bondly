import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link2, MapPin, Calendar, Grid3x3, Bookmark, Heart, MessageCircle, Lock, UserCheck, UserX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { usersApi, postsApi } from '../api';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import PostCard from '../components/feed/PostCard';
import { Spinner, EmptyState } from '../components/common/index';
import { VerifiedBadge } from '../components/common/index';
import { formatCount } from '../utils';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowersModal from '../components/profile/FollowersModal';
import FollowRequestsModal from '../components/profile/FollowRequestsModal';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { toggleFollow } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [followModal, setFollowModal] = useState(null);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabPosts, setTabPosts] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [actioning, setActioning] = useState(false);

  const targetUsername = username || currentUser?.username;
  const isOwnProfile = !username || username === currentUser?.username;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { user } = await usersApi.getProfile(targetUsername);
      setProfileUser(user);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [targetUsername]);

  useEffect(() => {
    if (targetUsername) loadProfile();
  }, [targetUsername, loadProfile]);

  useEffect(() => {
    if (profileUser) setActiveTab('posts');
  }, [profileUser?.id]);

  const loadTabPosts = useCallback(async () => {
    if (!profileUser || !profileUser.canViewContent) return;
    setTabLoading(true);
    try {
      let result;
      if (activeTab === 'saved') result = await postsApi.getSaved();
      else if (activeTab === 'liked') result = await postsApi.getLiked();
      else result = await postsApi.getUserPosts(profileUser.id);
      setTabPosts(result.posts);
    } catch {
      setTabPosts([]);
    } finally {
      setTabLoading(false);
    }
  }, [activeTab, profileUser]);

  useEffect(() => { loadTabPosts(); }, [loadTabPosts]);

  const handleFollow = async () => {
    if (actioning) return;
    setActioning(true);
    try {
      const result = await toggleFollow(profileUser.id);
      setProfileUser(prev => ({
        ...prev,
        isFollowing: result.isFollowing,
        requestStatus: result.requestStatus,
        followersCount: result.followersCount,
        canViewContent: prev.isOwnProfile || !prev.isPrivate || result.isFollowing,
      }));
    } catch {
      loadProfile();
    } finally {
      setActioning(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setTabPosts(prev => prev.filter(p => p.id !== postId));
    setProfileUser(prev => prev ? { ...prev, postsCount: Math.max(0, prev.postsCount - 1) } : prev);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-30 glass border-b border-border-base px-5 py-4">
          <h1 className="text-lg font-semibold text-text-primary">Profile</h1>
        </div>
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      </div>
    );
  }

  if (notFound || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-30 glass border-b border-border-base px-5 py-4">
          <h1 className="text-lg font-semibold text-text-primary">Profile</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <p className="text-5xl mb-4">🫥</p>
          <p className="text-text-primary font-semibold">This account doesn't exist</p>
          <p className="text-text-muted text-sm mt-1">Try searching for someone else</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'posts', icon: Grid3x3, label: 'Posts', count: profileUser.postsCount },
    ...(isOwnProfile ? [
      { key: 'saved', icon: Bookmark, label: 'Saved' },
      { key: 'liked', icon: Heart, label: 'Liked' },
    ] : []),
  ];

  const followButtonLabel = () => {
    if (profileUser.isFollowing) return 'Following';
    if (profileUser.requestStatus === 'pending') return 'Requested';
    return 'Follow';
  };
  const followButtonVariant = () => {
    if (profileUser.isFollowing) return 'following';
    if (profileUser.requestStatus === 'pending') return 'secondary';
    return 'follow';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-border-base px-5 py-4 flex items-center gap-3">
        <div>
          <h1 className="text-base font-semibold text-text-primary leading-tight">{profileUser.name}</h1>
          <p className="text-xs text-text-muted">{formatCount(profileUser.postsCount)} posts</p>
        </div>
        {profileUser.isPrivate && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-text-muted glass px-2.5 py-1 rounded-full">
            <Lock size={11} /> Private
          </div>
        )}
      </div>

      {/* Cover */}
      <div className="relative h-44 sm:h-56 overflow-hidden bg-surface-3">
        {profileUser.cover ? (
          <img src={profileUser.cover} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-400/40 via-indigo-400/30 to-cyan-300/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-app-bg/70 via-app-bg/10 to-transparent" />
      </div>

      {/* Profile Card — floats over cover */}
      <div className="px-5 pb-0">
        <div className="flex items-end justify-between -mt-14 mb-5 relative z-10">
          {/* Avatar with neu-raised ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full neu-raised-sm p-1">
              <Avatar src={profileUser.avatar} alt={profileUser.name} size="2xl"
                className="!w-full !h-full ring-2 ring-surface" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-1">
            {isOwnProfile ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Edit profile</Button>
                {profileUser.isPrivate && (
                  <Button variant="secondary" size="sm" onClick={() => setRequestsOpen(true)}
                    icon={<UserCheck size={14} />}>
                    Requests
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant={followButtonVariant()}
                  size="sm"
                  onClick={handleFollow}
                  disabled={actioning}
                >
                  {actioning ? '...' : followButtonLabel()}
                </Button>
                <Button variant="secondary" size="sm" icon={<MessageCircle size={14} />}
                  onClick={() => navigate(`/messages?user=${profileUser.id}`)}>
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Name + bio */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-xl font-bold text-text-primary">{profileUser.name}</h2>
            {profileUser.verified && <VerifiedBadge size={18} />}
            {profileUser.isPrivate && <Lock size={14} className="text-text-muted" />}
          </div>
          <p className="text-text-muted text-sm mb-3">@{profileUser.username}</p>
          {profileUser.bio && (
            <p className="text-text-primary/85 text-sm leading-relaxed mb-3">{profileUser.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-muted">
            {profileUser.location && (
              <span className="flex items-center gap-1"><MapPin size={13} /> {profileUser.location}</span>
            )}
            {profileUser.website && (
              <a href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-brand hover:underline">
                <Link2 size={13} /> {profileUser.website}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={13} /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats row — neu-raised pill */}
        <div className="flex items-center justify-around py-4 px-3 mb-2 neu-raised-sm rounded-2xl">
          <div className="text-center flex-1">
            <span className="block text-xl font-bold text-text-primary">{formatCount(profileUser.postsCount)}</span>
            <span className="text-xs text-text-muted">Posts</span>
          </div>
          <div className="w-px h-8 bg-border-base" />
          <button onClick={() => setFollowModal('followers')} className="text-center flex-1 hover:opacity-80 transition-opacity">
            <span className="block text-xl font-bold text-text-primary">{formatCount(profileUser.followersCount)}</span>
            <span className="text-xs text-text-muted">Followers</span>
          </button>
          <div className="w-px h-8 bg-border-base" />
          <button onClick={() => setFollowModal('following')} className="text-center flex-1 hover:opacity-80 transition-opacity">
            <span className="block text-xl font-bold text-text-primary">{formatCount(profileUser.followingCount)}</span>
            <span className="text-xs text-text-muted">Following</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-base px-5 mt-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all mr-2
              ${activeTab === tab.key ? 'text-text-primary border-brand' : 'text-text-muted border-transparent hover:text-text-secondary'}`}>
            <tab.icon size={14} /> {tab.label}
            {tab.count != null && <span className="text-xs text-text-muted ml-0.5">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Posts or Private Lock */}
      {!profileUser.canViewContent ? (
        <div className="flex flex-col items-center py-20 text-center px-8">
          <div className="w-20 h-20 rounded-full neu-raised flex items-center justify-center mb-5">
            <Lock size={32} className="text-text-muted" />
          </div>
          <p className="text-text-primary font-semibold text-lg mb-1">This account is private</p>
          <p className="text-text-muted text-sm">
            {profileUser.requestStatus === 'pending'
              ? 'Your follow request is pending approval'
              : 'Follow this account to see their photos and videos'}
          </p>
        </div>
      ) : (
        <div>
          {tabLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : tabPosts.length > 0 ? (
            tabPosts.map(post => <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />)
          ) : (
            <EmptyState icon={Grid3x3} title={`No ${activeTab} yet`} />
          )}
        </div>
      )}

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} onUpdated={(u) => { setProfileUser(p => ({ ...p, ...u })); updateUser(u); }} />
      <FollowersModal isOpen={!!followModal} onClose={() => setFollowModal(null)} targetUser={profileUser} type={followModal} />
      <FollowRequestsModal isOpen={requestsOpen} onClose={() => setRequestsOpen(false)} />
    </div>
  );
}
