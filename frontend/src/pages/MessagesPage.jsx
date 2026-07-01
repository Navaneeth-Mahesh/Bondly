import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import NewMessageModal from '../components/messages/NewMessageModal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';
import { messagesApi } from '../api';

export default function MessagesPage() {
  const { user } = useAuth();
  const { setActiveConversationId, refreshUnreadMessages } = useApp();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { conversations: data } = await messagesApi.getConversations();
      setConversations(data);

      const startUserId = searchParams.get('user');
      if (startUserId) {
        const { conversation } = await messagesApi.startConversation(startUserId);
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conversation.id);
          return exists ? prev : [conversation, ...prev];
        });
        setActive(conversation);
        setShowChatOnMobile(true);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    setActiveConversationId(active?.id || null);
    return () => setActiveConversationId(null);
  }, [active?.id, setActiveConversationId]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === message.conversationId);
        if (idx === -1) {
          loadConversations();
          return prev;
        }
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: { ...message, isRead: message.conversationId === active?.id },
          updatedAt: message.createdAt,
        };
        const [moved] = updated.splice(idx, 1);
        return [moved, ...updated];
      });
      refreshUnreadMessages();
    };
    socket.on('message:new', handleNewMessage);
    return () => socket.off('message:new', handleNewMessage);
  }, [socket, active?.id, loadConversations, refreshUnreadMessages]);

  const handleSelect = (conv) => {
    setActive(conv);
    setShowChatOnMobile(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id && c.lastMessage ? { ...c, lastMessage: { ...c.lastMessage, isRead: true } } : c))
    );
  };

  const handleStartNew = async (targetUser) => {
    try {
      const { conversation } = await messagesApi.startConversation(targetUser.id);
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversation.id);
        return exists ? prev : [conversation, ...prev];
      });
      setActive(conversation);
      setShowChatOnMobile(true);
      setNewMessageOpen(false);
    } catch (err) {
      console.error('Failed to start conversation:', err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-11rem)] md:h-screen flex">
      <div className={`w-full md:w-[360px] flex-shrink-0 border-r border-border-base flex flex-col h-full ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-base">
          <h1 className="text-lg font-semibold text-text-primary">{user?.username}</h1>
          <button onClick={() => setNewMessageOpen(true)} className="p-2 rounded-full hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors">
            <PenSquare size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            loading={loading}
            activeId={active?.id}
            onSelect={handleSelect}
            currentUserId={user?.id}
          />
        </div>
      </div>

      <div className={`flex-1 ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
        <ChatWindow conversation={active} onBack={() => setShowChatOnMobile(false)} />
      </div>

      <NewMessageModal isOpen={newMessageOpen} onClose={() => setNewMessageOpen(false)} onSelect={handleStartNew} />
    </div>
  );
}
