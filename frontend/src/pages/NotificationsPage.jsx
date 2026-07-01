import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, UserCheck, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { timeAgo } from '../utils';
import { Link } from 'react-router-dom';
import { usersApi } from '../api';

const iconMap = {
  like: { icon: Heart, color: 'bg-rose-500/15 text-rose-400' },
  comment: { icon: MessageCircle, color: 'bg-blue-500/15 text-blue-400' },
  follow: { icon: UserPlus, color: 'bg-violet-500/15 text-violet-400' },
  follow_request: { icon: UserPlus, color: 'bg-amber-500/15 text-amber-400' },
  follow_accept: { icon: UserCheck, color: 'bg-green-500/15 text-green-400' },
};

export default function NotificationsPage() {
  const { notifications, markAllRead } = useApp();
  const [unreadIdsAtOpen] = useState(() => new Set(notifications.filter(n => !n.read).map(n => n.id)));
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const { requests: data } = await usersApi.getFollowRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load follow requests:', err.message);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  useEffect(() => {
    if (unreadIdsAtOpen.size === 0) return;
    const timeout = setTimeout(() => { markAllRead(); }, 1200);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (requestId) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    try {
      await usersApi.acceptFollowRequest(requestId);
    } catch (err) {
      console.error('Failed to accept request:', err.message);
      loadRequests();
    }
  };

  const handleDecline = async (requestId) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    try {
      await usersApi.declineFollowRequest(requestId);
    } catch (err) {
      console.error('Failed to decline request:', err.message);
      loadRequests();
    }
  };

  const isNew = (n) => unreadIdsAtOpen.has(n.id);
  const newOnes = notifications.filter(isNew);
  const earlier = notifications.filter(n => !isNew(n));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-border-base px-5 py-4">
        <h1 className="text-lg font-semibold text-text-primary">Notifications</h1>
      </div>

      {/* Pending Follow Requests */}
      {!requestsLoading && requests.length > 0 && (
        <div>
          <div className="px-5 py-2.5 bg-amber-500/5 border-b border-border-base">
            <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Follow requests</p>
          </div>
          <AnimatePresence>
            {requests.map(r => (
              <motion.div
                key={r.id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-border-base"
              >
                <Link to={`/user/${r.from?.username}`}>
                  <Avatar src={r.from?.avatar} alt={r.from?.name} size="md" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/user/${r.from?.username}`} className="font-semibold text-sm text-text-primary hover:underline">
                    {r.from?.name}
                  </Link>
                  <p className="text-xs text-text-muted">@{r.from?.username} wants to follow you</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" onClick={() => handleAccept(r.id)} icon={<Check size={13} />}>Accept</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleDecline(r.id)} icon={<X size={13} />}>Decline</Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New Section */}
      {newOnes.length > 0 && (
        <div>
          <div className="px-5 py-2.5 bg-brand/5 border-b border-border-base">
            <p className="text-xs font-semibold text-brand/70 uppercase tracking-wider">New</p>
          </div>
          {newOnes.map(n => <NotifRow key={n.id} notif={n} isNew />)}
        </div>
      )}

      {/* Earlier Section */}
      <div>
        {earlier.length > 0 && newOnes.length > 0 && (
          <div className="px-5 py-2.5 border-b border-border-base">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Earlier</p>
          </div>
        )}
        {earlier.map(n => <NotifRow key={n.id} notif={n} />)}
      </div>

      {notifications.length === 0 && requests.length === 0 && !requestsLoading && (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-text-secondary text-sm">No notifications yet</p>
          <p className="text-text-muted text-xs mt-1">When people interact with you, it'll show here</p>
        </div>
      )}
    </div>
  );
}

function NotifRow({ notif, isNew }) {
  const meta = iconMap[notif.type] || iconMap.like;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-start gap-3 px-5 py-4 border-b border-border-base hover:bg-surface-3/50 transition-colors cursor-pointer ${isNew ? 'bg-brand/[0.04]' : ''}`}
    >
      <div className="relative flex-shrink-0">
        <Link to={`/user/${notif.fromUser?.username}`}>
          <Avatar src={notif.fromUser?.avatar} alt={notif.fromUser?.name} size="md" />
        </Link>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${meta.color}`}>
          <Icon size={10} fill="currentColor" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary/90 leading-snug">
          <Link to={`/user/${notif.fromUser?.username}`} className="font-semibold text-text-primary hover:underline">
            {notif.fromUser?.name}
          </Link>
          {' '}{notif.message}
        </p>
        {notif.preview && (
          <p className="text-xs text-text-muted mt-1 line-clamp-1 italic">{notif.preview}</p>
        )}
        <p className="text-xs text-text-muted mt-1">{timeAgo(notif.createdAt)}</p>
      </div>

      {isNew && (
        <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1.5" />
      )}
    </motion.div>
  );
}
