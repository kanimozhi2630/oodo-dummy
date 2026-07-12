import mongoose from 'mongoose';

const csrActivitySchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Community', 'Environment', 'Education', 'Health', 'Charity', 'Volunteering', 'Other'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, default: '' },
    maxParticipants: { type: Number, default: 0 },
    currentParticipants: { type: Number, default: 0 },
    points: { type: Number, default: 10 },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('CsrActivity', csrActivitySchema);
