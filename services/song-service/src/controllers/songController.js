const Song = require('../models/Song');

// GET /api/songs
exports.getAllSongs = async (req, res) => {
  try {
    const {
      search = '',
      sort = 'newest',
      page = 1,
      limit = 10,
      mine = false,
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { title:  { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album:  { $regex: search, $options: 'i' } },
      ];
    }

    if (mine === 'true' && req.user) {
      filter.createdBy = req.user.id;
    }

    // Build sort
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt:  1 },
      title:  { title:      1 },
      year:   { year:      -1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    // Pagination
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Song.countDocuments(filter);
    const songs = await Song.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      songs,
      pagination: {
        total,
        page:       parseInt(page),
        pages:      Math.ceil(total / parseInt(limit)),
        limit:      parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/songs/:id
exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/songs
exports.createSong = async (req, res) => {
  try {
    const { title, artist, album, year, genre, duration } = req.body;

    if (!title || !artist)
      return res.status(400).json({ message: 'Title and artist are required' });

    const song = await Song.create({
      title,
      artist,
      album,
      year,
      genre,
      duration,
      createdBy:         req.user.id,
      createdByUsername: req.user.username,
    });

    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/songs/:id
exports.updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Only owner or admin can update
    if (song.createdBy !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const updated = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/songs/:id
exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Only admin can delete
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only admins can delete songs' });

    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Song deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};