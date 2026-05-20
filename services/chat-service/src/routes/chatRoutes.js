const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  getRoomMessages,
  getMyConversations,
  getOrCreateRoom,
  markAsRead,
} = require('../controllers/chatController');

router.get('/conversations',        protect, getMyConversations);
router.post('/room',                protect, getOrCreateRoom);
router.get('/room/:roomId',         protect, getRoomMessages);
router.put('/room/:roomId/read',    protect, markAsRead);

module.exports = router;