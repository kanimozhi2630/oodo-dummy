import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    monthlyPoints: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    activitiesCompleted: { type: Number, default: 0 },
    challengesCompleted: { type: Number, default: 0 },
    lastActivity: { type: Date, default: null },
  },
  { timestamps: true }
);

leaderboardSchema.index({ organization: 1, totalPoints: -1 });
leaderboardSchema.index({ user: 1, organization: 1 }, { unique: true });

export default mongoose.model('Leaderboard', leaderboardSchema);
