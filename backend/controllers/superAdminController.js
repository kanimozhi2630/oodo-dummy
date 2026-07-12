import Organization from '../models/Organization.js';
import User from '../models/User.js';

// @desc  Get Super Admin Dashboard analytics
// @route GET /api/super-admin/dashboard
// @access Private (Super Admin)
export const getSuperAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalOrgs,
      activeOrgs,
      suspendedOrgs,
      totalUsers,
      planBreakdown
    ] = await Promise.all([
      Organization.countDocuments({}),
      Organization.countDocuments({ isActive: true }),
      Organization.countDocuments({ isActive: false }),
      User.countDocuments({ role: { $ne: 'super_admin' } }),
      Organization.aggregate([
        { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
      ])
    ]);

    // Format subscription plan counts
    const plans = { free: 0, basic: 0, professional: 0, enterprise: 0 };
    planBreakdown.forEach(p => {
      if (p._id in plans) plans[p._id] = p.count;
    });

    // Recent organizations
    const recentOrgs = await Organization.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        suspendedOrganizations: suspendedOrgs,
        totalUsersGlobally: totalUsers,
        plans
      },
      recentOrganizations: recentOrgs
    });
  } catch (error) {
    next(error);
  }
};
