import Proof from '../models/Proof.js';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import Leaderboard from '../models/Leaderboard.js';
import Department from '../models/Department.js';
import Organization from '../models/Organization.js';
import Notification from '../models/Notification.js';
import Badge from '../models/Badge.js';
import Participation from '../models/Participation.js';

// === Helper to check and unlock badges automatically ===
export const checkAndAwardBadges = async (userId, orgId) => {
  try {
    const leaderboard = await Leaderboard.findOne({ user: userId, organization: orgId });
    if (!leaderboard) return;

    // 1. Get completed CSR count
    const completedCsrCount = await Participation.countDocuments({
      user: userId,
      organization: orgId,
      status: 'completed'
    });

    // 2. Get approved challenges
    const approvedProofs = await Proof.find({
      uploadedBy: userId,
      organization: orgId,
      status: 'approved'
    }).populate('challenge');

    const completedChallenges = approvedProofs.map(p => p.challenge);

    // List of active badges in the organization
    const orgBadges = await Badge.find({ organization: orgId });
    const unlockedBadgeIds = new Set(leaderboard.badges.map(b => b.toString()));

    const badgeAwards = [];

    // Local Helper to award a badge if eligible
    const awardBadge = async (badgeName, conditionMet) => {
      if (!conditionMet) return;
      const targetBadge = orgBadges.find(b => b.name.toLowerCase() === badgeName.toLowerCase());
      if (targetBadge && !unlockedBadgeIds.has(targetBadge._id.toString())) {
        leaderboard.badges.push(targetBadge._id);
        badgeAwards.push(targetBadge);
        
        // Notify user
        await Notification.create({
          organization: orgId,
          recipient: userId,
          title: '🏅 Badge Unlocked!',
          message: `Congratulations! You unlocked the "${targetBadge.name}" badge.`,
          type: 'achievement'
        });
      }
    };

    // Evaluate badge logic:
    // 🌱 Green Beginner: First CSR activity completed
    await awardBadge('Green Beginner', completedCsrCount >= 1);

    // 🌳 Tree Guardian: Plant 10 trees
    const treeChallengesCount = completedChallenges.filter(c => 
      c.title.toLowerCase().includes('tree') || c.description.toLowerCase().includes('tree')
    ).length;
    // We also count CSR activities with tree in the title
    const completedCsrActivities = await Participation.find({
      user: userId, organization: orgId, status: 'completed'
    }).populate('activity');
    const treeCsrCount = completedCsrActivities.filter(p => 
      p.activity && (p.activity.title.toLowerCase().includes('tree') || p.activity.description.toLowerCase().includes('tree'))
    ).length;
    await awardBadge('Tree Guardian', (treeChallengesCount + treeCsrCount) >= 1); // Unlock on first tree event or count of 1

    // ❤️ CSR Hero: Complete 5 CSR activities
    await awardBadge('CSR Hero', completedCsrCount >= 5);

    // ♻ Recycling Champion: Complete recycling challenge
    const recyclingCount = completedChallenges.filter(c => 
      c.title.toLowerCase().includes('recycle') || c.description.toLowerCase().includes('recycle') || c.title.toLowerCase().includes('plastic')
    ).length;
    await awardBadge('Recycling Champion', recyclingCount >= 1);

    // ⚡ Energy Saver: Switch off lights
    const energyCount = completedChallenges.filter(c => 
      c.title.toLowerCase().includes('light') || c.title.toLowerCase().includes('power') || c.title.toLowerCase().includes('energy')
    ).length;
    await awardBadge('Energy Saver', energyCount >= 1);

    // 🚶 Health Ambassador: Complete walking challenge
    const walkingCount = completedChallenges.filter(c => 
      c.title.toLowerCase().includes('walk') || c.title.toLowerCase().includes('steps') || c.title.toLowerCase().includes('cycle')
    ).length;
    await awardBadge('Health Ambassador', walkingCount >= 1);

    // 📚 Education Supporter: Donate Books
    const booksCount = completedChallenges.filter(c => 
      c.title.toLowerCase().includes('book') || c.description.toLowerCase().includes('book')
    ).length;
    await awardBadge('Education Supporter', booksCount >= 1);

    // 👕 Kindness Champion: Donate Clothes
    const clothesCount = completedChallenges.filter(c => 
      c.title.toLowerCase().includes('cloth') || c.description.toLowerCase().includes('cloth') || c.title.toLowerCase().includes('donate')
    ).length;
    await awardBadge('Kindness Champion', clothesCount >= 1);

    // Save leaderboard updates if any badge was unlocked
    if (badgeAwards.length > 0) {
      await leaderboard.save();
    }
  } catch (err) {
    console.error('Error awarding badges:', err);
  }
};

// @desc  Submit proof for a challenge
// @route POST /api/proofs
// @access Private (Employee)
export const submitProof = async (req, res, next) => {
  try {
    const { challenge: challengeId, proofUrl, fileType, description, location } = req.body;
    const orgId = req.user.organization._id;

    const challenge = await Challenge.findOne({ _id: challengeId, organization: orgId });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    // Check if proof already exists for this challenge and user
    const existingProof = await Proof.findOne({
      uploadedBy: req.user._id,
      challenge: challengeId,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingProof) {
      return res.status(400).json({ success: false, message: 'Proof already submitted for this challenge.' });
    }

    const proof = await Proof.create({
      organization: orgId,
      uploadedBy: req.user._id,
      challenge: challengeId,
      proofUrl,
      fileType,
      description,
      location,
      status: 'pending'
    });

    // Notify HR Managers in the organization
    const hrManagers = await User.find({ organization: orgId, role: 'hr_manager' });
    const hrNotifications = hrManagers.map(hr => ({
      organization: orgId,
      recipient: hr._id,
      sender: req.user._id,
      title: '📁 New Proof Uploaded',
      message: `${req.user.name} submitted proof for the "${challenge.title}" challenge.`,
      type: 'info',
      link: '/dashboard/hr'
    }));
    if (hrNotifications.length > 0) {
      await Notification.insertMany(hrNotifications);
    }

    res.status(201).json({ success: true, message: 'Proof submitted successfully.', proof });
  } catch (error) {
    next(error);
  }
};

// @desc  Get pending proofs for HR review
// @route GET /api/proofs/pending
// @access Private (HR / CEO)
export const getPendingProofs = async (req, res, next) => {
  try {
    const proofs = await Proof.find({ organization: req.user.organization._id, status: 'pending' })
      .populate('uploadedBy', 'name email department')
      .populate('challenge', 'title points category description')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proofs.length, proofs });
  } catch (error) {
    next(error);
  }
};

// @desc  Get employee's own proofs
// @route GET /api/proofs/my
// @access Private (Employee)
export const getMyProofs = async (req, res, next) => {
  try {
    const proofs = await Proof.find({ uploadedBy: req.user._id })
      .populate('challenge', 'title points category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proofs.length, proofs });
  } catch (error) {
    next(error);
  }
};

// @desc  Review employee proof (Approve/Reject)
// @route PUT /api/proofs/:id/review
// @access Private (HR / CEO)
export const reviewProof = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const orgId = req.user.organization._id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or rejected.' });
    }

    const proof = await Proof.findOne({ _id: req.params.id, organization: orgId })
      .populate('challenge');
    if (!proof) {
      return res.status(404).json({ success: false, message: 'Proof submission not found.' });
    }

    if (proof.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This proof has already been reviewed.' });
    }

    proof.status = status;
    proof.feedback = feedback || '';
    proof.reviewedBy = req.user._id;
    await proof.save();

    const employee = await User.findById(proof.uploadedBy);

    if (status === 'approved') {
      // 1. Add employee to completedBy in Challenge
      const challenge = await Challenge.findById(proof.challenge._id);
      if (challenge) {
        if (!challenge.completedBy.includes(proof.uploadedBy)) {
          challenge.completedBy.push(proof.uploadedBy);
        }
        if (!challenge.participants.includes(proof.uploadedBy)) {
          challenge.participants.push(proof.uploadedBy);
        }
        await challenge.save();
      }

      // 2. Award XP and Increment Challenges Completed in Leaderboard
      const points = challenge ? challenge.points : 50;
      const leaderboard = await Leaderboard.findOne({ user: proof.uploadedBy, organization: orgId });
      if (leaderboard) {
        leaderboard.totalPoints += points;
        leaderboard.monthlyPoints += points;
        leaderboard.weeklyPoints += points;
        leaderboard.challengesCompleted += 1;
        leaderboard.level = Math.floor(leaderboard.totalPoints / 200) + 1;
        leaderboard.lastActivity = new Date();
        await leaderboard.save();
      }

      // 3. Increment Organization and Department ESG scores
      const scoreKey = challenge && challenge.category ? `${challenge.category.toLowerCase()}Score` : 'environmentalScore';
      const org = await Organization.findById(orgId);
      if (org) {
        org[scoreKey] = Math.min(100, (org[scoreKey] || 75) + 1);
        org.esgScore = Math.min(100, Math.round(((org.environmentalScore || 75) + (org.socialScore || 75) + (org.governanceScore || 75)) / 3));
        await org.save();
      }

      if (employee && employee.department) {
        const dept = await Department.findById(employee.department);
        if (dept) {
          dept.esgScore = Math.min(100, (dept.esgScore || 70) + 2);
          await dept.save();
        }
      }

      // 4. Evaluate and award badges automatically
      await checkAndAwardBadges(proof.uploadedBy, orgId);

      // 5. Send approval notification to employee
      await Notification.create({
        organization: orgId,
        recipient: proof.uploadedBy,
        sender: req.user._id,
        title: '✅ Challenge Proof Approved!',
        message: `Your proof for the "${challenge?.title}" challenge has been approved. You earned ${points} XP!`,
        type: 'success'
      });
    } else {
      // Send rejection notification to employee
      await Notification.create({
        organization: orgId,
        recipient: proof.uploadedBy,
        sender: req.user._id,
        title: '❌ Challenge Proof Rejected',
        message: `Your proof for the "${proof.challenge?.title}" challenge was rejected. Reason: ${feedback || 'Does not meet requirements.'}`,
        type: 'warning'
      });
    }

    res.status(200).json({ success: true, message: `Proof reviewed and ${status} successfully.`, proof });
  } catch (error) {
    next(error);
  }
};
