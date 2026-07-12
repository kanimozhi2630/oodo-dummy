import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Leaderboard from '../models/Leaderboard.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @desc  Register a new company + CEO user
// @route POST /api/auth/register
// @access Public
export const registerCompany = async (req, res, next) => {
  try {
    const {
      companyName, companyEmail, companyPhone, industry, country,
      companySize, numberOfEmployees, adminName, adminEmail, password,
    } = req.body;

    // Check if org email already exists
    const existingOrg = await Organization.findOne({ email: companyEmail.toLowerCase() });
    if (existingOrg) {
      return res.status(400).json({ success: false, message: 'Company with this email already exists.' });
    }

    // Create organization
    const organization = await Organization.create({
      name: companyName,
      email: companyEmail,
      phone: companyPhone,
      industry,
      country,
      companySize,
      numberOfEmployees,
    });

    // Create CEO user
    const user = await User.create({
      organization: organization._id,
      name: adminName,
      email: adminEmail,
      password,
      role: 'ceo',
    });

    // Initialize leaderboard entry
    await Leaderboard.create({ organization: organization._id, user: user._id });

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Please login.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user across any org — email is unique within org but could be same across orgs
    // We use the first match for simplicity; multi-org login can be extended
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('organization', 'name isActive')
      .populate('department', 'name');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been disabled. Contact your administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
// @access Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organization', 'name email industry country companySize')
      .populate('department', 'name');

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user profile
// @route PUT /api/auth/profile
// @access Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, preferences },
      { new: true, runValidators: true }
    ).populate('organization', 'name').populate('department', 'name');

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Change password
// @route PUT /api/auth/change-password
// @access Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};
