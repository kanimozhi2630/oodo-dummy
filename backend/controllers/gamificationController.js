import Challenge from '../models/Challenge.js';
import Badge from '../models/Badge.js';
import Leaderboard from '../models/Leaderboard.js';

// === CHALLENGES ===
export const getChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ organization: req.user.organization._id })
      .populate('badge', 'name icon color')
      .sort({ startDate: 1 });
    res.status(200).json({ success: true, challenges });
  } catch (error) { next(error); }
};

export const createChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.create({ ...req.body, organization: req.user.organization._id, createdBy: req.user._id });
    res.status(201).json({ success: true, challenge });
  } catch (error) { next(error); }
};

export const joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    if (challenge.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already joined this challenge.' });
    }

    challenge.participants.push(req.user._id);
    await challenge.save();
    res.status(200).json({ success: true, message: 'Joined challenge.' });
  } catch (error) { next(error); }
};

export const completeChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    if (!challenge.completedBy.includes(req.user._id)) {
      challenge.completedBy.push(req.user._id);
      await challenge.save();

      // Award points
      await Leaderboard.findOneAndUpdate(
        { user: req.user._id, organization: req.user.organization._id },
        { $inc: { totalPoints: challenge.points, challengesCompleted: 1 }, lastActivity: new Date() }
      );
    }

    res.status(200).json({ success: true, message: 'Challenge completed. Points awarded!' });
  } catch (error) { next(error); }
};

// === BADGES ===
export const getBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ organization: req.user.organization._id, isActive: true })
      .sort({ rarity: 1, pointsRequired: 1 });
    res.status(200).json({ success: true, badges });
  } catch (error) { next(error); }
};

export const createBadge = async (req, res, next) => {
  try {
    const badge = await Badge.create({ ...req.body, organization: req.user.organization._id });
    res.status(201).json({ success: true, badge });
  } catch (error) { next(error); }
};

// === LEADERBOARD ===
export const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    let sortField = 'totalPoints';
    if (period === 'monthly') sortField = 'monthlyPoints';
    if (period === 'weekly') sortField = 'weeklyPoints';

    const leaderboard = await Leaderboard.find({ organization: req.user.organization._id })
      .populate('user', 'name email avatar role department')
      .populate('badges', 'name icon color')
      .sort({ [sortField]: -1 })
      .limit(50);

    // Attach ranks
    const ranked = leaderboard.map((entry, idx) => ({ ...entry.toJSON(), rank: idx + 1 }));
    res.status(200).json({ success: true, leaderboard: ranked });
  } catch (error) { next(error); }
};

export const getMyStats = async (req, res, next) => {
  try {
    const stats = await Leaderboard.findOne({ user: req.user._id, organization: req.user.organization._id })
      .populate('badges', 'name icon color rarity');

    const allEntries = await Leaderboard.find({ organization: req.user.organization._id }).sort({ totalPoints: -1 });
    const rank = allEntries.findIndex((e) => e.user.toString() === req.user._id.toString()) + 1;

    res.status(200).json({ success: true, stats, rank, totalParticipants: allEntries.length });
  } catch (error) { next(error); }
};
