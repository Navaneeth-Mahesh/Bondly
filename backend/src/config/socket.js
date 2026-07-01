import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Maps userId (string) -> socketId, shared with controllers via app.set('onlineUsers', ...)
export const onlineUsers = new Map();

export const initSocket = (httpServer, app) => {
  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
      credentials: true,
    },
  });

  // Auth middleware for socket connections — expects { token } in the handshake auth payload
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).maxTimeMS(8000);
      if (!user) return next(new Error('User not found'));
      socket.userId = user._id.toString();
      socket.userInfo = { id: user._id, name: user.name, username: user.username, avatar: user.avatar };
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    io.emit('presence:update', { userId: socket.userId, online: true });

    socket.on('typing:start', ({ conversationId, toUserId }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('typing:start', { conversationId, fromUserId: socket.userId });
      }
    });

    socket.on('typing:stop', ({ conversationId, toUserId }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('typing:stop', { conversationId, fromUserId: socket.userId });
      }
    });

    socket.on('disconnect', () => {
      if (onlineUsers.get(socket.userId) === socket.id) {
        onlineUsers.delete(socket.userId);
        io.emit('presence:update', { userId: socket.userId, online: false });
      }
    });
  });

  app.set('io', io);
  app.set('onlineUsers', onlineUsers);

  return io;
};
