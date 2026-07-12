import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    industry: {
      type: String,
      required: true,
      enum: [
        'Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Energy',
        'Retail', 'Education', 'Agriculture', 'Construction', 'Transportation',
        'Hospitality', 'Media', 'Telecommunications', 'Other'
      ],
    },
    country: { type: String, required: true },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      required: true,
    },
    numberOfEmployees: { type: Number, required: true },
    esgScore: { type: Number, default: 0, min: 0, max: 100 },
    environmentalScore: { type: Number, default: 0, min: 0, max: 100 },
    socialScore: { type: Number, default: 0, min: 0, max: 100 },
    governanceScore: { type: Number, default: 0, min: 0, max: 100 },
    logo: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    subscriptionPlan: { type: String, enum: ['free', 'basic', 'professional', 'enterprise'], default: 'free' },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'professional', 'enterprise'], default: 'free' },
      expiresAt: { type: Date, default: null },
    },
    settings: {
      fiscalYear: { type: String, default: 'Jan-Dec' },
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);
