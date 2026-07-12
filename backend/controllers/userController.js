import User from '../models/User.js';
import Leaderboard from '../models/Leaderboard.js';
import Notification from '../models/Notification.js';

// @desc  Get all users in organization (HR restricted to employees)
// @route GET /api/users
// @access Private (CEO / HR Manager)
export const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, department, search } = req.query;
    const filter = { organization: req.user.organization._id };

    // HR can only list employees
    if (req.user.role === 'hr_manager') {
      filter.role = 'employee';
    } else if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (department) filter.department = department;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const users = await User.find(filter)
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc  Create a new user in the organization (HR restricted to employees)
// @route POST /api/users
// @access Private (CEO / HR Manager)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    const orgId = req.user.organization._id;

    let targetRole = role;
    if (req.user.role === 'hr_manager') {
      // HR can only create employees
      targetRole = 'employee';
    } else {
      // CEO cannot create another CEO or Super Admin
      if (['ceo', 'super_admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role selection.' });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase(), organization: orgId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists in your organization.' });
    }

    const user = await User.create({
      organization: orgId,
      name,
      email,
      password,
      role: targetRole,
      department: department || null,
      phone: phone || null,
    });

    // Initialize leaderboard entry
    await Leaderboard.create({ organization: orgId, user: user._id });

    // Send welcome notification
    await Notification.create({
      organization: orgId,
      recipient: user._id,
      sender: req.user._id,
      title: 'Welcome to EcoSphere!',
      message: `Hi ${name}, your account has been created. Welcome to EcoSphere ESG Management Platform.`,
      type: 'success',
    });

    res.status(201).json({ success: true, message: 'User created successfully.', user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user (HR restricted to employees)
// @route PUT /api/users/:id
// @access Private (CEO / HR Manager)
export const updateUser = async (req, res, next) => {
  try {
    const { name, role, department, phone, isActive } = req.body;
    const orgId = req.user.organization._id;

    const query = { _id: req.params.id, organization: orgId };
    if (req.user.role === 'hr_manager') {
      query.role = 'employee';
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or access denied.' });
    }

    // Don't allow demoting the CEO
    if (user.role === 'ceo' && role && role !== 'ceo') {
      return res.status(400).json({ success: false, message: 'Cannot change the role of the CEO.' });
    }

    let targetRole = role;
    if (req.user.role === 'hr_manager') {
      targetRole = 'employee'; // Force employee
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, role: targetRole, department, phone, isActive },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};

// @desc  Reset user password
// @route PUT /api/users/:id/reset-password
// @access Private (CEO / HR Manager)
export const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const orgId = req.user.organization._id;

    const query = { _id: req.params.id, organization: orgId };
    if (req.user.role === 'hr_manager') {
      query.role = 'employee';
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or access denied.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle user active status
// @route PUT /api/users/:id/toggle-status
// @access Private (CEO / HR Manager)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const orgId = req.user.organization._id;

    const query = { _id: req.params.id, organization: orgId };
    if (req.user.role === 'hr_manager') {
      query.role = 'employee';
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or access denied.' });
    }

    if (user.role === 'ceo') {
      return res.status(400).json({ success: false, message: 'Cannot disable the CEO account.' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully.`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};
