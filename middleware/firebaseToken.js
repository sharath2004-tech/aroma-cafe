import admin from '../config/firebaseAdmin.js';

// Verifies the Firebase ID token only — used by /api/auth/sync, which runs
// before a matching Mongo User document is guaranteed to exist.
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '❌ No token provided' });
  }

  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: '❌ Invalid or expired token' });
  }
};

export default verifyFirebaseToken;
