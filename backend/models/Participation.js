import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'CsrActivity', required: true },
    status: { type: String, enum: ['registered', 'attended', 'completed', 'cancelled'], default: 'registered' },
    pointsEarned: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

participationSchema.index({ user: 1, activity: 1 }, { unique: true });

export default mongoose.model('Participation', participationSchema);
