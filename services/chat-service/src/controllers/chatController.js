const Message = require('../models/Message');

// GET /api/chat/room/:roomId — get messages in a room
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip     = (parseInt(page) - 1) * parseInt(limit);
    const total    = await Message.countDocuments({ roomId });
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      messages,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/chat/conversations — get all conversations for current user
exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get latest message from each unique room the user is part of
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage:     { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          senderUsername:  { $first: '$senderUsername' },
          receiverUsername:{ $first: '$receiverUsername' },
          senderId:        { $first: '$senderId' },
          receiverId:      { $first: '$receiverId' },
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/chat/room — create or get a room between two users
exports.getOrCreateRoom = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const myId = req.user.id;

    if (!otherUserId)
      return res.status(400).json({ message: 'otherUserId is required' });

    // Room ID is deterministic — same for both users
    const roomId = [myId, otherUserId].sort().join('_');

    res.json({ roomId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/chat/room/:roomId/read — mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { roomId: req.params.roomId, receiverId: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};