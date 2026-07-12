import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT and attach user to request
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('organization', 'name isActive').populate('department', 'name');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been disabled.' });
    }

    // Use optional chaining — older org docs without isActive should pass
    if (user.role !== 'super_admin' && user.organization?.isActive === false) {
      return res.status(401).json({ success: false, message: 'Organization account is inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
  }
};

// Role-based access control middleware factory
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
      });
    }
    next();
  };
};

// Ensure same organization
export const sameOrg = (req, res, next) => {
  const orgId = req.params.orgId || req.body.organization;
  if (orgId && orgId.toString() !== req.user.organization._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied. Cross-organization access forbidden.' });
  }
  next();
};
