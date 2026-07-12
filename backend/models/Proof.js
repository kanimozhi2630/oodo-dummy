import mongoose from 'mongoose';

const proofSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    proofUrl: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'pdf', 'video', 'document'], required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Proof', proofSchema);
