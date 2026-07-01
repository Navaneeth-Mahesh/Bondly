import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';
import { VerifiedBadge, Spinner, EmptyState } from '../common/index';
import { timeAgo } from '../../utils';
import { MessageCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function ConversationList({ conversations, loading, activeId, onSelect, currentUserId }) {
  const { isUserOnline } = useSocket();

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner /></div>;
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        subtitle="Start a conversation from someone's profile"
      />
    );
  }

  return (
    <div>
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const isUnread = conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.sender !== currentUserId;
        const online = conv.otherUser && isUserOnline(conv.otherUser.id);

        return (
          <motion.button
            key={conv.id}
            onClick={() => onSelect(conv)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
              ${isActive ? 'bg-brand/10' : 'hover:bg-surface-3'}`}
          >
            <div className="relative flex-shrink-0">
              <Avatar src={conv.otherUser?.avatar} alt={conv.otherUser?.name} size="lg" />
              {online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-surface" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-sm truncate ${isUnread ? 'font-bold text-text-primary' : 'font-medium text-text-primary'}`}>
                  {conv.otherUser?.name}
                </span>
                {conv.otherUser?.verified && <VerifiedBadge size={12} />}
              </div>
              <p className={`text-xs truncate ${isUnread ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                {conv.lastMessage
                  ? (conv.lastMessage.image && !conv.lastMessage.text ? '📷 Photo' : conv.lastMessage.text)
                  : 'Say hello 👋'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[11px] text-text-muted">{timeAgo(conv.updatedAt)}</span>
              {isUnread && <span className="w-2 h-2 rounded-full bg-brand" />}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
