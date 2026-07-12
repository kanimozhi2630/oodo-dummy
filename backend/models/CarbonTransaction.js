import mongoose from 'mongoose';

const carbonTransactionSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emissionFactor: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionFactor', required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    co2Equivalent: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    scope: { type: String, enum: ['Scope 1', 'Scope 2', 'Scope 3'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('CarbonTransaction', carbonTransactionSchema);
