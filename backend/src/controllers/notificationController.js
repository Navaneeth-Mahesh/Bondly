import Notification from '../models/Notification.js';

// @route GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatar verified')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        message: n.message,
        read: n.read,
        post: n.post,
        createdAt: n.createdAt,
        fromUser: n.sender && {
          id: n.sender._id,
          name: n.sender.name,
          username: n.sender.username,
          avatar: n.sender.avatar,
          verified: n.sender.verified,
        },
      })),
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/notifications/read-all
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/notifications/:id/read
export const markOneRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
