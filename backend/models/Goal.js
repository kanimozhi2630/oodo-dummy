import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['Environmental', 'Social', 'Governance'], required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, required: true },
    startDate: { type: Date, required: true },
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'overdue', 'cancelled'], default: 'active' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  },
  { timestamps: true }
);

goalSchema.virtual('progressPercent').get(function () {
  if (this.targetValue === 0) return 0;
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100);
});

goalSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Goal', goalSchema);
