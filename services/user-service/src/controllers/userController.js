const User = require('../models/User');

// GET /api/users/profile — get own profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findOne({ authId: req.user.id });
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/users/profile — create profile (called after register)
exports.createProfile = async (req, res) => {
  try {
    const { authId, username, email } = req.body;

    if (!authId || !username || !email)
      return res.status(400).json({ message: 'authId, username and email are required' });

    const existing = await User.findOne({ authId });
    if (existing)
      return res.status(409).json({ message: 'Profile already exists' });

    const user = await User.create({ authId, username, email });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/profile — update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const { bio, avatar, favoriteGenre } = req.body;

    const user = await User.findOneAndUpdate(
      { authId: req.user.id },
      { bio, avatar, favoriteGenre },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users — get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments();
    const users = await User.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      users,
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

// GET /api/users/:id — get user by id (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/role — change user role (admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ message: 'Role must be user or admin' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/users/:id — delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};