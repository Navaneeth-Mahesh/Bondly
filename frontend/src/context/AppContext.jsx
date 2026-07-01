import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { postsApi, notificationsApi, usersApi, messagesApi } from '../api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { socket } = useSocket();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Load first page of feed + notifications once authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      setNotifications([]);
      setUnreadMessageCount(0);
      return;
    }
    loadFeed(1, true);
    refreshNotifications();
    refreshUnreadMessages();
  }, [isAuthenticated]);

  // Listen for incoming real-time messages to bump the unread badge
  // (the messages page itself handles appending to the open conversation)
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message) => {
      const conversationId = message.conversationId;
      if (conversationId !== activeConversationId) {
        setUnreadMessageCount((prev) => prev + 1);
      }
    };
    socket.on('message:new', handleNewMessage);
    return () => socket.off('message:new', handleNewMessage);
  }, [socket, activeConversationId]);

  const refreshUnreadMessages = useCallback(async () => {
    try {
      const { conversations } = await messagesApi.getConversations();
      const count = conversations.filter((c) => c.lastMessage && !c.lastMessage.isRead && c.lastMessage.sender !== user?.id).length;
      setUnreadMessageCount(count);
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    }
  }, [user?.id]);

  const loadFeed = useCallback(async (pageToLoad = 1, replace = false) => {
    setFeedLoading(true);
    try {
      const { posts: newPosts, hasMore: more } = await postsApi.getFeed(pageToLoad, 10);
      setPosts((prev) => (replace ? newPosts : [...prev, ...newPosts]));
      setHasMore(more);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Failed to load feed:', err.message);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!feedLoading && hasMore) loadFeed(page + 1, false);
  }, [feedLoading, hasMore, page, loadFeed]);

  const refreshNotifications = useCallback(async () => {
    try {
      const { notifications: notifs, unreadCount: count } = await notificationsApi.getAll();
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationsApi.markAllRead();
    } catch (err) {
      console.error('Failed to mark notifications read:', err.message);
    }
  }, []);

  const toggleLike = useCallback(async (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      )
    );
    try {
      const { isLiked, likesCount } = await postsApi.toggleLike(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLiked, likesCount } : p)));
    } catch (err) {
      console.error('Failed to toggle like:', err.message);
      loadFeed(1, true);
    }
  }, [loadFeed]);

  const toggleSave = useCallback(async (postId) => {
    try {
      await postsApi.toggleSave(postId);
    } catch (err) {
      console.error('Failed to toggle save:', err.message);
    }
  }, []);

  const toggleFollow = useCallback(async (userId) => {
    try {
      const result = await usersApi.toggleFollow(userId);
      return result; // { success, isFollowing, requestStatus, followersCount }
    } catch (err) {
      console.error('Failed to toggle follow:', err.message);
      throw err;
    }
  }, []);

  const addPost = useCallback(async (content, image = null) => {
    const { post } = await postsApi.create({ content, image: image || '' });
    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  const sharePost = useCallback(async (postId) => {
    try {
      const { sharesCount } = await postsApi.share(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, sharesCount } : p)));
    } catch (err) {
      console.error('Failed to share post:', err.message);
    }
  }, []);

  const removePost = useCallback(async (postId) => {
    await postsApi.remove(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return (
    <AppContext.Provider
      value={{
        user, updateUser,
        posts, feedLoading, hasMore, loadMore, loadFeed,
        toggleLike, toggleSave, toggleFollow, addPost, sharePost, removePost,
        notifications, unreadCount, markAllRead, refreshNotifications,
        unreadMessageCount, refreshUnreadMessages, setActiveConversationId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
