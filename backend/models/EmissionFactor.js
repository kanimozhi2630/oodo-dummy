import mongoose from 'mongoose';

const emissionFactorSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Scope 1', 'Scope 2', 'Scope 3'],
      required: true,
    },
    subCategory: { type: String, required: true },
    unit: { type: String, required: true },
    factorValue: { type: Number, required: true },
    source: { type: String, default: 'IPCC' },
    year: { type: Number, default: new Date().getFullYear() },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('EmissionFactor', emissionFactorSchema);
