import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import Avatar from '../common/Avatar';
import { VerifiedBadge, Spinner } from '../common/index';
import EmojiPickerButton from '../common/EmojiPickerButton';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagesApi } from '../../api';
import { fileToBase64 } from '../../utils/fileToBase64';

export default function ChatWindow({ conversation, onBack }) {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const fileRef = useRef();
  const bottomRef = useRef();
  const typingTimeoutRef = useRef();

  const otherUser = conversation?.otherUser;

  const loadMessages = useCallback(async () => {
    if (!conversation?.id) return;
    setLoading(true);
    try {
      const { messages: data } = await messagesApi.getMessages(conversation.id);
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversation?.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  useEffect(() => {
    if (!socket || !conversation?.id) return;
    const handleNewMessage = (message) => {
      if (message.conversationId === conversation.id) {
        setMessages((prev) => [...prev, message]);
      }
    };
    const handleTypingStart = ({ conversationId }) => {
      if (conversationId === conversation.id) setOtherTyping(true);
    };
    const handleTypingStop = ({ conversationId }) => {
      if (conversationId === conversation.id) setOtherTyping(false);
    };
    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, conversation?.id]);

  const emitTyping = useCallback((isTyping) => {
    if (!socket || !otherUser?.id) return;
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
      conversationId: conversation.id,
      toUserId: otherUser.id,
    });
  }, [socket, conversation?.id, otherUser?.id]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToBase64(file, { maxSizeMB: 4 });
      setPendingImage(dataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !pendingImage) || sending) return;
    setSending(true);
    setError('');
    const payload = { text: text.trim(), image: pendingImage || '' };
    try {
      const { message } = await messagesApi.sendMessage(conversation.id, payload);
      setMessages((prev) => [...prev, message]);
      setText('');
      setPendingImage(null);
      emitTyping(false);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
          <Send size={26} className="text-text-muted" />
        </div>
        <p className="text-text-secondary font-medium">Select a conversation</p>
        <p className="text-text-muted text-sm mt-1">Choose someone to start chatting with</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-base glass">
        <button onClick={onBack} className="md:hidden p-1 -ml-1 text-text-secondary hover:text-text-primary">
          <ArrowLeft size={20} />
        </button>
        <Link to={`/user/${otherUser?.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <Avatar src={otherUser?.avatar} alt={otherUser?.name} size="md" />
            {isUserOnline(otherUser?.id) && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-surface" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-text-primary truncate">{otherUser?.name}</span>
              {otherUser?.verified && <VerifiedBadge size={12} />}
            </div>
            <p className="text-xs text-text-muted">
              {isUserOnline(otherUser?.id) ? 'Active now' : `@${otherUser?.username}`}
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, i) => {
              const isMine = msg.sender?.id === user?.id;
              const prevMsg = messages[i - 1];
              const showAvatar = !isMine && (!prevMsg || prevMsg.sender?.id !== msg.sender?.id);
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <div className="w-6 flex-shrink-0">
                      {showAvatar && <Avatar src={msg.sender?.avatar} alt={msg.sender?.name} size="xs" />}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.image && (
                      <img src={msg.image} alt="" className="rounded-2xl max-w-full max-h-64 object-cover mb-1" />
                    )}
                    {msg.text && (
                      <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md'
                          : 'bg-surface-3 text-text-primary rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {otherTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 flex-shrink-0"><Avatar src={otherUser?.avatar} alt={otherUser?.name} size="xs" /></div>
                <div className="px-4 py-2.5 rounded-2xl bg-surface-3 rounded-bl-md flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted"
                      animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs text-center py-1.5 px-4">{error}</p>
      )}

      <AnimatePresence>
        {pendingImage && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-2">
            <div className="relative inline-block">
              <img src={pendingImage} alt="" className="h-20 rounded-xl object-cover" />
              <button onClick={() => setPendingImage(null)}
                className="absolute -top-1.5 -right-1.5 p-1 bg-black/70 rounded-full text-white">
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-border-base">
        <button onClick={() => fileRef.current?.click()} className="p-2 text-text-muted hover:text-brand transition-colors">
          <ImageIcon size={20} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        <EmojiPickerButton onSelect={(emoji) => setText((t) => t + emoji)} placement="top"
          className="p-2 text-text-muted hover:text-amber-400 transition-colors" />
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Message..."
          className="flex-1 neu-inset rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={(!text.trim() && !pendingImage) || sending}
          className="p-2.5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white disabled:opacity-40 transition-opacity"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
