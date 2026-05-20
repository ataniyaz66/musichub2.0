const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getMyProfile,
  createProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  changeUserRole,
  deleteUser,
} = require('../controllers/userController');

// Own profile routes
router.get('/profile',  protect, getMyProfile);
router.post('/profile', createProfile);        // called internally after register
router.put('/profile',  protect, updateMyProfile);

// Admin routes
router.get('/',           protect, adminOnly, getAllUsers);
router.get('/:id',        protect, adminOnly, getUserById);
router.put('/:id/role',   protect, adminOnly, changeUserRole);
router.delete('/:id',     protect, adminOnly, deleteUser);

module.exports = router;