import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import { Spinner } from '../common/index';
import { VerifiedBadge } from '../common/index';
import { usersApi } from '../../api';

export default function NewMessageModal({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) { setQuery(''); setUsers([]); return; }
    setLoading(true);
    usersApi.search('').then(({ users: data }) => setUsers(data)).finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      setLoading(true);
      usersApi.search(query).then(({ users: data }) => setUsers(data)).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New message" size="sm">
      <input
        type="text"
        placeholder="Search people..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full neu-inset rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all mb-4"
      />
      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelect(u)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-3 transition-colors text-left"
            >
              <Avatar src={u.avatar} alt={u.name} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-text-primary truncate">{u.name}</span>
                  {u.verified && <VerifiedBadge size={12} />}
                </div>
                <p className="text-xs text-text-muted truncate">@{u.username}</p>
              </div>
            </button>
          ))}
          {users.length === 0 && <p className="text-center text-text-muted text-sm py-8">No users found</p>}
        </div>
      )}
    </Modal>
  );
}
