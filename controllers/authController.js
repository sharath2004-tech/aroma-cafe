import User from '../models/User.js';

const ALLOWED_ROLES = ['customer', 'chef', 'admin'];

// Emails that are always admins. Everyone else registers as a customer;
// an admin can promote users to chef/admin from the dashboard.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'urbancravek@gmail.com')
  .toLowerCase()
  .split(',')
  .map((e) => e.trim());

const isAdminEmail = (email) => !!email && ADMIN_EMAILS.includes(email.toLowerCase());

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
// Roles are assigned server-side only: admin emails become admins, everyone else
// starts as a customer. Admins promote users to chef from the dashboard.
export const sync = async (req, res) => {
  try {
    const { uid, email, name: tokenName, picture, phone_number: phoneNumber } = req.firebaseUser;
    const { name } = req.body;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      try {
        user = await User.create({
          firebaseUid: uid,
          name: name || tokenName || email?.split('@')[0] || (phoneNumber ? `User ${phoneNumber.slice(-4)}` : 'User'),
          email,
          phone: phoneNumber,
          avatar: picture,
          role: isAdminEmail(email) ? 'admin' : 'customer'
        });
      } catch (createError) {
        // Two syncs can race on first sign-in; if the other one won, use its result.
        if (createError.code !== 11000) throw createError;
        user = await User.findOne({ firebaseUid: uid });
      }
    } else {
      let changed = false;
      if (!user.phone && phoneNumber) {
        user.phone = phoneNumber;
        changed = true;
      }
      // Bootstrap: if the admin email already registered before this rule existed.
      if (isAdminEmail(user.email) && user.role !== 'admin') {
        user.role = 'admin';
        changed = true;
      }
      if (changed) await user.save();
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

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: '❌ User not found' });
    }
    if (isAdminEmail(target.email) && role !== 'admin') {
      return res.status(400).json({ message: '❌ This account is a permanent admin' });
    }

    target.role = role;
    const user = await target.save();
    res.json({ message: '✅ Role updated', user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};
