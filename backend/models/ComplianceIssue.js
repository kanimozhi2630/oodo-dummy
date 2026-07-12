import mongoose from 'mongoose';

const complianceIssueSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Environmental', 'Social', 'Governance', 'Legal', 'Financial', 'Safety', 'Other'],
      required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    dueDate: { type: Date, required: true },
    resolvedAt: { type: Date, default: null },
    resolution: { type: String, default: '' },
    relatedPolicy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', default: null },
    relatedAudit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('ComplianceIssue', complianceIssueSchema);
