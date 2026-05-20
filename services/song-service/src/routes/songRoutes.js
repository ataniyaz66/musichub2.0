const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
} = require('../controllers/songController');

// Public
router.get('/',    getAllSongs);
router.get('/:id', getSongById);

// Protected
router.post('/',    protect, createSong);
router.put('/:id',  protect, updateSong);
router.delete('/:id', protect, deleteSong);

module.exports = router;