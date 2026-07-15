import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ALLOWED_ROLES = ['customer', 'chef', 'admin'];

const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: '❌ User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      role: ALLOWED_ROLES.includes(role) ? role : 'customer'
    });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      message: '✅ User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '❌ Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '❌ Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      message: '✅ Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const logout = async (req, res) => {
  // JWTs are stateless; logout is handled client-side by discarding the token.
  res.json({ message: '✅ Logged out successfully' });
};
