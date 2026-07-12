import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import CsrActivity from '../models/CsrActivity.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import Goal from '../models/Goal.js';
import Leaderboard from '../models/Leaderboard.js';
import Audit from '../models/Audit.js';
import Policy from '../models/Policy.js';
import Challenge from '../models/Challenge.js';
import Badge from '../models/Badge.js';
import Participation from '../models/Participation.js';
import Reward from '../models/Reward.js';
import Organization from '../models/Organization.js';

// Helper: safely convert to ObjectId
const toObjId = (id) => new mongoose.Types.ObjectId(id.toString());

// ─────────────────────────────────────────────────────────────────────────────
// CEO DASHBOARD  GET /api/dashboard/ceo
// ─────────────────────────────────────────────────────────────────────────────
export const getCeoDashboard = async (req, res, next) => {
  try {
    const orgId = toObjId(req.user.organization._id);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalUsers,
      totalDepts,
      carbonAgg,
      openIssues,
      activitiesCount,
      activeGoals,
      topUsers,
      deptRankings,
      monthlyTrend,
      org,
    ] = await Promise.all([
      User.countDocuments({ organization: orgId, isActive: true }),
      Department.countDocuments({ organization: orgId }),
      CarbonTransaction.aggregate([
        { $match: { organization: orgId } },
        { $group: { _id: null, total: { $sum: '$co2Equivalent' } } },
      ]),
      ComplianceIssue.countDocuments({ organization: orgId, status: { $in: ['open', 'in_progress'] } }),
      CsrActivity.countDocuments({ organization: orgId }),
      Goal.countDocuments({ organization: orgId, status: 'active' }),
      Leaderboard.find({ organization: orgId })
        .sort({ totalPoints: -1 })
        .limit(5)
        .populate('user', 'name avatar role'),
      Department.find({ organization: orgId }).sort({ esgScore: -1 }).limit(8),
      CarbonTransaction.aggregate([
        { $match: { organization: orgId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$co2Equivalent' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Organization.findById(orgId),
    ]);

    const totalCarbonEmissions = carbonAgg[0]?.total || 0;

    // Compute ESG score dynamically if not stored on org
    const esgScore =
      org?.esgScore ||
      Math.min(
        100,
        Math.round(
          ((activeGoals > 0 ? 40 : 20) +
            (openIssues === 0 ? 30 : Math.max(0, 30 - openIssues * 3)) +
            30) *
            (totalUsers > 0 ? 1 : 0.5)
        )
      );

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees: totalUsers,
        totalDepartments: totalDepts,
        totalCarbonEmissions,
        openComplianceIssues: openIssues,
        csrActivities: activitiesCount,
        activeGoals,
        esgScore,
      },
      topUsers,
      deptRankings,
      monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ESG MANAGER DASHBOARD  GET /api/dashboard/esg
// ─────────────────────────────────────────────────────────────────────────────
export const getEsgDashboard = async (req, res, next) => {
  try {
    const orgId = toObjId(req.user.organization._id);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [byScope, goals, recentTransactions, totalTransactions, monthlyTrend, departments] =
      await Promise.all([
        CarbonTransaction.aggregate([
          { $match: { organization: orgId } },
          {
            $group: {
              _id: '$scope',
              total: { $sum: '$co2Equivalent' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Goal.find({ organization: orgId }).sort({ targetDate: 1 }).limit(20),
        CarbonTransaction.find({ organization: orgId })
          .sort({ date: -1 })
          .limit(10)
          .populate('department', 'name')
          .populate('emissionFactor', 'name'),
        CarbonTransaction.countDocuments({ organization: orgId }),
        CarbonTransaction.aggregate([
          { $match: { organization: orgId, date: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: { year: { $year: '$date' }, month: { $month: '$date' } },
              total: { $sum: '$co2Equivalent' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        Department.find({ organization: orgId }).select('name carbonBudget esgScore').sort({ esgScore: -1 })
      ]);

    // Calculate department emissions
    const deptEmissions = await CarbonTransaction.aggregate([
      { $match: { organization: orgId } },
      { $group: { _id: '$department', totalEmissions: { $sum: '$co2Equivalent' } } }
    ]);

    const departmentStats = departments.map(d => {
      const em = deptEmissions.find(e => e._id?.toString() === d._id.toString());
      return {
        _id: d._id,
        name: d.name,
        esgScore: d.esgScore,
        carbonBudget: d.carbonBudget,
        totalEmissions: em ? em.totalEmissions : 0
      };
    });

    res.status(200).json({
      success: true,
      byScope,
      goals,
      recentTransactions,
      totalTransactions,
      monthlyTrend,
      departmentStats,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HR DASHBOARD  GET /api/dashboard/hr
// ─────────────────────────────────────────────────────────────────────────────
export const getHrDashboard = async (req, res, next) => {
  try {
    const orgId = toObjId(req.user.organization._id);

    const [employees, activities, upcomingActivities, recentParticipations, departmentStats] =
      await Promise.all([
        User.countDocuments({ organization: orgId, isActive: true }),
        CsrActivity.aggregate([
          { $match: { organization: orgId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        CsrActivity.find({
          organization: orgId,
          status: { $in: ['upcoming', 'ongoing'] },
        })
          .sort({ startDate: 1 })
          .limit(8),
        Participation.find({ organization: orgId })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('user', 'name avatar')
          .populate('activity', 'title category'),
        Department.find({ organization: orgId })
          .sort({ name: 1 })
          .select('name esgScore'),
      ]);

    res.status(200).json({
      success: true,
      employees,
      activities,
      upcomingActivities,
      recentParticipations,
      departmentStats,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE DASHBOARD  GET /api/dashboard/compliance
// ─────────────────────────────────────────────────────────────────────────────
export const getComplianceDashboard = async (req, res, next) => {
  try {
    const orgId = toObjId(req.user.organization._id);

    const [
      issuesBySeverity,
      issuesByStatus,
      recentAudits,
      policies,
      totalIssues,
      totalAudits,
      totalPolicies,
    ] = await Promise.all([
      ComplianceIssue.aggregate([
        { $match: { organization: orgId } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ComplianceIssue.aggregate([
        { $match: { organization: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Audit.find({ organization: orgId }).sort({ startDate: -1 }).limit(8),
      Policy.find({ organization: orgId }).sort({ createdAt: -1 }).limit(5),
      ComplianceIssue.countDocuments({ organization: orgId }),
      Audit.countDocuments({ organization: orgId }),
      Policy.countDocuments({ organization: orgId }),
    ]);

    res.status(200).json({
      success: true,
      issuesBySeverity,
      issuesByStatus,
      recentAudits,
      policies,
      totalIssues,
      totalAudits,
      totalPolicies,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE DASHBOARD  GET /api/dashboard/employee
// ─────────────────────────────────────────────────────────────────────────────
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const orgId = toObjId(req.user.organization._id);
    const userId = req.user._id;

    const [myLeaderboard, myActivities, activeChallenges, allEntries, myRewards] =
      await Promise.all([
        Leaderboard.findOne({ user: userId, organization: orgId }).populate(
          'badges',
          'name icon rarity category'
        ),
        Participation.find({ user: userId, organization: orgId })
          .populate('activity', 'title category startDate points status')
          .sort({ createdAt: -1 })
          .limit(8),
        Challenge.find({
          organization: orgId,
          status: { $in: ['upcoming', 'active'] },
        })
          .sort({ endDate: 1 })
          .limit(5),
        Leaderboard.find({ organization: orgId })
          .sort({ totalPoints: -1 })
          .select('user totalPoints'),
        Reward.find({ user: userId, organization: orgId })
          .sort({ awardedAt: -1 })
          .limit(5),
      ]);

    // Find user's rank in the leaderboard
    const rank =
      allEntries.findIndex((e) => e.user.toString() === userId.toString()) + 1;

    res.status(200).json({
      success: true,
      stats: myLeaderboard,
      rank,
      totalParticipants: allEntries.length,
      myActivities,
      myChallenges: activeChallenges,
      myRewards,
    });
  } catch (error) {
    next(error);
  }
};
