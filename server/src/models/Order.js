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
  quantity: { type: Number, min: 1, required: true },
  unit: { type: String, trim: true, default: 'project' },
  dimensions: { type: dimensionSchema, default: () => ({}) },
  material: { type: String, trim: true, default: '' },
  finish: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
  unitPrice: { type: Number, min: 0, default: 0 },
  amount: { type: Number, min: 0, default: 0 }
}, { _id: true });

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, trim: true, default: '' },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerSnapshot: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' }
  },
  items: { type: [itemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  projectTitle: { type: String, required: true, trim: true, maxlength: 160 },
  projectType: { type: String, trim: true, default: '' },
  siteAddress: { type: String, trim: true, default: '' },
  preferredTimeline: { type: String, trim: true, default: '' },
  customerNotes: { type: String, trim: true, default: '' },
  subtotal: { type: Number, min: 0, default: 0 },
  total: { type: Number, min: 0, required: true },
  currency: { type: String, default: 'PKR' },
  status: {
    type: String,
    enum: ['pending_confirmation', 'confirmed', 'in_production', 'quality_check', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
    default: 'pending_confirmation',
    index: true
  },
  deliveryNotes: { type: String, trim: true, maxlength: 2000, default: '' },
  adminNotes: { type: String, trim: true, maxlength: 3000, default: '' },
  estimatedDeliveryDate: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  timeline: { type: [timelineSchema], default: [] }
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
