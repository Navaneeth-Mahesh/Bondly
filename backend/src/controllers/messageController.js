import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { validateImageField } from '../utils/validateImage.js';

const serializeConversation = (conv, currentUserId) => {
  const obj = conv.toObject ? conv.toObject() : conv;
  const other = obj.participants.find((p) => !p._id.equals(currentUserId));
  return {
    id: obj._id,
    otherUser: other && {
      id: other._id,
      name: other.name,
      username: other.username,
      avatar: other.avatar,
      verified: other.verified,
    },
    lastMessage: obj.lastMessage
      ? {
          id: obj.lastMessage._id,
          text: obj.lastMessage.text,
          image: obj.lastMessage.image,
          sender: obj.lastMessage.sender,
          createdAt: obj.lastMessage.createdAt,
          isRead: obj.lastMessage.readBy?.some((id) => id.toString() === currentUserId.toString()),
        }
      : null,
    updatedAt: obj.lastMessageAt,
  };
};

const serializeMessage = (msg) => {
  const obj = msg.toObject ? msg.toObject() : msg;
  return {
    id: obj._id,
    conversationId: obj.conversation,
    sender: obj.sender._id ? {
      id: obj.sender._id,
      name: obj.sender.name,
      username: obj.sender.username,
      avatar: obj.sender.avatar,
    } : obj.sender,
    text: obj.text,
    image: obj.image,
    readBy: obj.readBy,
    createdAt: obj.createdAt,
  };
};

// @route GET /api/messages/conversations
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name username avatar verified')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      conversations: conversations
        .filter((c) => c.participants.length === 2)
        .map((c) => serializeConversation(c, req.user._id)),
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/messages/conversations  body: { userId }
export const startConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't message yourself" });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) return res.status(404).json({ success: false, message: 'User not found' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate('participants', 'name username avatar verified')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, userId] });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name username avatar verified')
        .populate('lastMessage');
    }

    res.status(201).json({ success: true, conversation: serializeConversation(conversation, req.user._id) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/messages/conversations/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conversation.participants.some((p) => p.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Not a participant in this conversation' });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark all as read by current user
    await Message.updateMany(
      { conversation: conversation._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ success: true, messages: messages.map(serializeMessage) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/messages/conversations/:id/messages  body: { text, image }
export const sendMessage = async (req, res, next) => {
  try {
    const { text = '', image = '' } = req.body;
    if (!text.trim() && !image) {
      return res.status(400).json({ success: false, message: 'Message must have text or an image' });
    }
    const imageError = validateImageField(image, 'Message image');
    if (imageError) return res.status(400).json({ success: false, message: imageError });

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conversation.participants.some((p) => p.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Not a participant in this conversation' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim(),
      image,
      readBy: [req.user._id],
    });
    await message.populate('sender', 'name username avatar');

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const serialized = serializeMessage(message);

    // Emit over socket to the other participant(s) if they're online
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    if (io && onlineUsers) {
      conversation.participants.forEach((p) => {
        if (!p.equals(req.user._id)) {
          const socketId = onlineUsers.get(p.toString());
          if (socketId) io.to(socketId).emit('message:new', serialized);
        }
      });
    }

    res.status(201).json({ success: true, message: serialized });
  } catch (err) {
    next(err);
  }
};
