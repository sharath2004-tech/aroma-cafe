import admin from '../config/firebaseAdmin.js';
import User from '../models/User.js';

// Verifies the Firebase ID token AND requires a matching Mongo profile
// (created via POST /api/auth/sync on first sign-in).
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '❌ No token provided' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(401).json({ message: '❌ No profile found for this account. Please sign in again.' });
    }

    req.firebaseUser = decoded;
    req.user = { userId: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: '❌ Invalid or expired token' });
  }
};

// Role guard — use after authMiddleware, e.g. requireRole('admin').
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: '❌ Access denied' });
  }
  next();
};

export default authMiddleware;
