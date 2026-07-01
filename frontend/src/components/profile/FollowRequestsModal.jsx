import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import { Spinner } from '../common/index';
import { usersApi } from '../../api';
import { timeAgo } from '../../utils';
import { Link } from 'react-router-dom';

export default function FollowRequestsModal({ isOpen, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { requests: data } = await usersApi.getFollowRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load follow requests:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const handleAccept = async (req) => {
    setActioning(p => ({ ...p, [req.id]: 'accept' }));
    try {
      await usersApi.acceptFollowRequest(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (err) {
      console.error('Failed to accept request:', err.message);
    } finally {
      setActioning(p => ({ ...p, [req.id]: null }));
    }
  };

  const handleDecline = async (req) => {
    setActioning(p => ({ ...p, [req.id]: 'decline' }));
    try {
      await usersApi.declineFollowRequest(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (err) {
      console.error('Failed to decline request:', err.message);
    } finally {
      setActioning(p => ({ ...p, [req.id]: null }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Follow Requests (${requests.length})`} size="sm">
      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-text-muted text-sm">No pending follow requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <motion.div key={req.id} layout exit={{ opacity: 0 }}
              className="flex items-center gap-3 py-2">
              <Link to={`/user/${req.from?.username}`} onClick={onClose}>
                <Avatar src={req.from?.avatar} alt={req.from?.name} size="md" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/user/${req.from?.username}`} onClick={onClose}
                  className="text-sm font-semibold text-text-primary hover:underline block truncate">
                  {req.from?.name}
                </Link>
                <p className="text-xs text-text-muted">@{req.from?.username} · {timeAgo(req.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleAccept(req)}
                  disabled={!!actioning[req.id]}
                  className="p-2 rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  title="Accept"
                >
                  <UserCheck size={15} />
                </button>
                <button
                  onClick={() => handleDecline(req)}
                  disabled={!!actioning[req.id]}
                  className="p-2 rounded-xl glass text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  title="Decline"
                >
                  <UserX size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Modal>
  );
}
