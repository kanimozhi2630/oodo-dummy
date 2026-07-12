import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    esgScore: { type: Number, default: 0, min: 0, max: 100 },
    carbonBudget: { type: Number, default: 0 },
    carbonUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: '#3B82F6' },
  },
  { timestamps: true }
);

departmentSchema.index({ name: 1, organization: 1 }, { unique: true });

export default mongoose.model('Department', departmentSchema);
