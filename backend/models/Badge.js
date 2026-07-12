import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: '#3B82F6' },
    category: { type: String, enum: ['Environmental', 'Social', 'Governance', 'Achievement', 'Special'], required: true },
    pointsRequired: { type: Number, default: 0 },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Badge', badgeSchema);
