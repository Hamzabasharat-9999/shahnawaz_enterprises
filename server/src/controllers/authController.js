import { notifyCustomer, notifyAdmin } from '../services/emailService.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';

export async function register(req, res) {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword, phone });
  const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };

  void notifyCustomer({ to: user.email, name: user.name, subject: 'Welcome to Shahnawaz Enterprises', heading: 'welcome to Shahnawaz Enterprises', message: 'Your account has been created successfully. You can now manage quotations, appointments, and project updates from your account.' });
  void notifyAdmin({ subject: 'New customer registration', heading: 'A new customer registered', message: 'A customer account has been created.', details: [{label:'Name',value:user.name},{label:'Email',value:user.email}] });
  res.status(201).json({ message: 'Account created successfully.', token: signToken(user), user: safeUser });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.json({
    message: 'Login successful.',
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

export async function me(req, res) {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, phone: req.user.phone } });
}
