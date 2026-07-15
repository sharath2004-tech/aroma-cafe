import User from '../models/User.js';

const ALLOWED_ROLES = ['customer', 'chef', 'admin'];

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt
});

// Called right after any successful Firebase sign-in (email/password, Google, phone OTP, ...).
// Creates the Mongo profile on first sign-in; returns the existing one otherwise.
// Role is only honored on creation so a returning user can't re-elevate themselves.
export const sync = async (req, res) => {
  try {
    const { uid, email, name: tokenName, picture, phone_number: phoneNumber } = req.firebaseUser;
    const { name, role } = req.body;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        name: name || tokenName || email?.split('@')[0] || (phoneNumber ? `User ${phoneNumber.slice(-4)}` : 'User'),
        email,
        phone: phoneNumber,
        avatar: picture,
        role: ALLOWED_ROLES.includes(role) ? role : 'customer'
      });
    } else if (!user.phone && phoneNumber) {
      user.phone = phoneNumber;
      await user.save();
    }

    res.json({ message: '✅ Synced', user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof phone === 'string') updates.phone = phone.trim() || undefined;
    if (typeof avatar === 'string') updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }
    res.json({ message: '✅ Profile updated', user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Admin only
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(toPublicUser) });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Admin only
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: '❌ Invalid role' });
    }
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: '❌ You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }
    res.json({ message: '✅ Role updated', user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};
