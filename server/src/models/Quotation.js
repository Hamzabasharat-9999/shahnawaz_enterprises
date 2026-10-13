import mongoose from 'mongoose';

const dimensionSchema = new mongoose.Schema({
  length: { type: Number, min: 0, default: 0 },
  width: { type: Number, min: 0, default: 0 },
  height: { type: Number, min: 0, default: 0 },
  unit: { type: String, trim: true, default: 'ft' }
}, { _id: false });

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: '' },
  quantity: { type: Number, min: 1, max: 100000, required: true },
  unit: { type: String, trim: true, default: 'project' },
  dimensions: { type: dimensionSchema, default: () => ({}) },
  material: { type: String, trim: true, maxlength: 120, default: '' },
  finish: { type: String, trim: true, maxlength: 120, default: '' },
  notes: { type: String, trim: true, maxlength: 1000, default: '' },
  unitPrice: { type: Number, min: 0, default: 0 },
  estimatedAmount: { type: Number, min: 0, default: 0 }
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerSnapshot: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' }
  },
  items: { type: [itemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  projectTitle: { type: String, required: true, trim: true, maxlength: 160 },
  projectType: { type: String, trim: true, maxlength: 100, default: '' },
  siteAddress: { type: String, trim: true, maxlength: 500, default: '' },
  preferredTimeline: { type: String, trim: true, maxlength: 100, default: '' },
  budgetRange: { type: String, trim: true, maxlength: 100, default: '' },
  customerNotes: { type: String, trim: true, maxlength: 3000, default: '' },
  estimatedSubtotal: { type: Number, min: 0, default: 0 },
  quotedTotal: { type: Number, min: 0, default: null },
  currency: { type: String, default: 'PKR' },
  status: { type: String, enum: ['submitted', 'under_review', 'needs_information', 'quoted', 'approved', 'rejected', 'cancelled'], default: 'submitted', index: true },
  adminNotes: { type: String, trim: true, maxlength: 3000, default: '' },
  rejectionReason: { type: String, trim: true, maxlength: 1000, default: '' },
  validUntil: { type: Date, default: null },
  reviewedAt: { type: Date, default: null },
  approvedAt: { type: Date, default: null }
}, { timestamps: true });

quotationSchema.index({ customer: 1, createdAt: -1 });
quotationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Quotation', quotationSchema);
