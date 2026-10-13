import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-password');
    if (user?.isActive) req.user = user;
  } catch {}
  next();
}
