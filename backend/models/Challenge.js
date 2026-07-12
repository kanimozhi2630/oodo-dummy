import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Environmental', 'Social', 'Governance', 'Health', 'Other'], required: true },
    points: { type: Number, required: true, default: 50 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', default: null },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    proofRequired: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Challenge', challengeSchema);
