import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Environmental', 'Social', 'Governance', 'HR', 'Legal', 'Financial', 'Other'],
      required: true,
    },
    version: { type: String, default: '1.0' },
    effectiveDate: { type: Date, required: true },
    reviewDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'archived', 'under_review'], default: 'draft' },
    document: { type: String, default: null },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Policy', policySchema);
