import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['Internal', 'External', 'Regulatory', 'Certification'],
      required: true,
    },
    scope: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
    findings: { type: String, default: '' },
    recommendations: { type: String, default: '' },
    score: { type: Number, min: 0, max: 100, default: null },
    nextAuditDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Audit', auditSchema);
