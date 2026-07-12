import CsrActivity from '../models/CsrActivity.js';
import Participation from '../models/Participation.js';
import Reward from '../models/Reward.js';
import Leaderboard from '../models/Leaderboard.js';

// === CSR ACTIVITIES ===
export const getCsrActivities = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = { organization: req.user.organization._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const activities = await CsrActivity.find(filter)
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });
    res.status(200).json({ success: true, activities });
  } catch (error) { next(error); }
};

export const createCsrActivity = async (req, res, next) => {
  try {
    const activity = await CsrActivity.create({
      ...req.body,
      organization: req.user.organization._id,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, activity });
  } catch (error) { next(error); }
};

export const updateCsrActivity = async (req, res, next) => {
  try {
    const activity = await CsrActivity.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found.' });
    res.status(200).json({ success: true, activity });
  } catch (error) { next(error); }
};

export const deleteCsrActivity = async (req, res, next) => {
  try {
    await CsrActivity.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    res.status(200).json({ success: true, message: 'Activity deleted.' });
  } catch (error) { next(error); }
};

// === PARTICIPATION ===
export const joinActivity = async (req, res, next) => {
  try {
    const activity = await CsrActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found.' });

    const existing = await Participation.findOne({ user: req.user._id, activity: req.params.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered for this activity.' });

    if (activity.maxParticipants > 0 && activity.currentParticipants >= activity.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Activity is full.' });
    }

    const participation = await Participation.create({
      organization: req.user.organization._id,
      user: req.user._id,
      activity: req.params.id,
    });

    activity.currentParticipants += 1;
    await activity.save();

    res.status(201).json({ success: true, participation });
  } catch (error) { next(error); }
};

export const getUserParticipations = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;
    const participations = await Participation.find({ user: userId, organization: req.user.organization._id })
      .populate('activity')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, participations });
  } catch (error) { next(error); }
};

export const completeParticipation = async (req, res, next) => {
  try {
    const participation = await Participation.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { status: 'completed', completedAt: new Date(), pointsEarned: req.body.points || 10 },
      { new: true }
    ).populate('activity');
    if (!participation) return res.status(404).json({ success: false, message: 'Participation not found.' });

    // Award points on leaderboard
    await Leaderboard.findOneAndUpdate(
      { user: participation.user, organization: req.user.organization._id },
      {
        $inc: { totalPoints: participation.pointsEarned, monthlyPoints: participation.pointsEarned, activitiesCompleted: 1 },
        lastActivity: new Date(),
      }
    );

    res.status(200).json({ success: true, participation });
  } catch (error) { next(error); }
};

// === REWARDS ===
export const getRewards = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;
    const rewards = await Reward.find({ user: userId, organization: req.user.organization._id })
      .populate('badge', 'name icon color')
      .populate('awardedBy', 'name')
      .sort({ awardedAt: -1 });
    res.status(200).json({ success: true, rewards });
  } catch (error) { next(error); }
};

export const createReward = async (req, res, next) => {
  try {
    const reward = await Reward.create({
      ...req.body,
      organization: req.user.organization._id,
      awardedBy: req.user._id,
    });

    // Update leaderboard
    await Leaderboard.findOneAndUpdate(
      { user: req.body.user, organization: req.user.organization._id },
      { $inc: { totalPoints: req.body.points } }
    );

    res.status(201).json({ success: true, reward });
  } catch (error) { next(error); }
};
