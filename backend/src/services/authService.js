import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV } from '../config/env.js';
import { logAudit } from '../middleware/auditMiddleware.js';

export const generateToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

export const registerUser = async ({ name, email, password, role, organization, phone, hospital, warehouse }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: (role || 'admin').toLowerCase(),
    organization: organization || '',
    phone: phone || '',
    hospital: hospital || '',
    warehouse: warehouse || '',
  });

  await logAudit({
    user: user.name,
    userRole: user.role,
    userId: user._id,
    action: 'Registered User',
    entity: 'User',
    entityId: user._id.toString(),
    detail: `New user created with role ${user.role}`,
    type: 'create',
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    token: generateToken(user._id),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  await logAudit({
    user: user.name,
    userRole: user.role,
    userId: user._id,
    action: 'User Logged In',
    entity: 'Auth',
    entityId: user._id.toString(),
    detail: `Role: ${user.role}`,
    type: 'update',
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    hospital: user.hospital,
    warehouse: user.warehouse,
    token: generateToken(user._id),
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
