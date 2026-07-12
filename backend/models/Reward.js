import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', default: null },
    points: { type: Number, required: true },
    reason: { type: String, required: true },
    type: { type: String, enum: ['badge', 'points', 'certificate', 'gift'], default: 'points' },
    awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Reward', rewardSchema);
