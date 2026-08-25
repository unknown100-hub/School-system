const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectMongo } = require('../config/mongo');

const tokenSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return process.env.JWT_SECRET;
};
const publicUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, branch: user.branch });
const createToken = (user) => jwt.sign({ sub: user._id.toString(), role: user.role, email: user.email }, tokenSecret(), { expiresIn: '8h' });

async function register(request, response) {
  try {
    await connectMongo();
    const { name, email, password, role, branch = '' } = request.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !password || !['admin', 'secretary'].includes(role)) return response.status(400).json({ message: 'Please complete all required fields.' });
    if (role === 'secretary' && !branch.trim()) return response.status(400).json({ message: 'A branch is required for secretaries.' });
    if (await User.exists({ email: normalizedEmail })) return response.status(409).json({ message: 'An account with this email already exists.' });
    if (role === 'admin' && await User.exists({}) && request.user?.role !== 'admin') return response.status(403).json({ message: 'An administrator must create additional admin accounts.' });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role, branch: role === 'admin' ? 'All' : branch.trim() });
    return response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error('Registration failed:', error.message);
    return response.status(503).json({ message: 'Authentication service is unavailable. Check the MongoDB Atlas connection.' });
  }
}

async function login(request, response) {
  try {
    await connectMongo();
    const email = String(request.body?.email || '').trim().toLowerCase();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(request.body?.password || '', user.passwordHash))) return response.status(401).json({ message: 'Invalid email or password.' });
    return response.json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return response.status(503).json({ message: 'Authentication service is unavailable. Check the MongoDB Atlas connection.' });
  }
}

function optionalAuth(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token) { try { request.user = jwt.verify(token, tokenSecret()); } catch { /* no admin privileges */ } }
  next();
}

module.exports = { register, login, optionalAuth };
