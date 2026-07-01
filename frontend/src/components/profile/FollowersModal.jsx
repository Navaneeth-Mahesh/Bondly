import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { Spinner } from '../common/index';
import { VerifiedBadge } from '../common/index';
import { useApp } from '../../context/AppContext';
import { usersApi } from '../../api';
import { formatCount } from '../../utils';

export default function FollowersModal({ isOpen, onClose, targetUser, type }) {
  const { toggleFollow } = useApp();
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async () => {
    if (!targetUser?.id || !type) return;
    setLoading(true);
    try {
      const fn = type === 'followers' ? usersApi.getFollowers : usersApi.getFollowing;
      const { users } = await fn(targetUser.id);
      setList(users);
    } catch (err) {
      console.error('Failed to load list:', err.message);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [targetUser?.id, type]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      loadList();
    }
  }, [isOpen, loadList]);

  const handleFollow = async (userId) => {
    try {
      const result = await toggleFollow(userId);
      setList(prev => prev.map(u => u.id === userId
        ? { ...u, isFollowing: result.isFollowing, requestStatus: result.requestStatus }
        : u
      ));
    } catch (err) {
      console.error('Failed to toggle follow:', err.message);
    }
  };

  const filtered = list.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={type === 'followers' ? `Followers · ${formatCount(targetUser?.followersCount || 0)}` : `Following · ${formatCount(targetUser?.followingCount || 0)}`}
      size="sm">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full neu-inset rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => (
            <div key={u.id} className="flex items-center gap-3">
              <Link to={`/user/${u.username}`} onClick={onClose}>
                <Avatar src={u.avatar} alt={u.name} size="md" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Link to={`/user/${u.username}`} onClick={onClose} className="font-medium text-sm text-text-primary truncate hover:underline">{u.name}</Link>
                  {u.verified && <VerifiedBadge size={12} />}
                </div>
                <p className="text-xs text-text-muted truncate">@{u.username}</p>
              </div>
              <Button
                variant={u.isFollowing || u.requestStatus === 'pending' ? 'following' : 'follow'}
                size="sm"
                onClick={() => handleFollow(u.id)}
              >
                {u.isFollowing ? 'Following' : u.requestStatus === 'pending' ? 'Requested' : 'Follow'}
              </Button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-text-muted text-sm py-6">No results found</p>}
        </div>
      )}
    </Modal>
  );
}
