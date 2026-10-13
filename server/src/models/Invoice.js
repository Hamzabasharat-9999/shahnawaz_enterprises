import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  description: { type: String, required: true, trim: true, maxlength: 240 },
  quantity: { type: Number, min: 0.01, required: true },
  unit: { type: String, trim: true, default: 'unit' },
  unitPrice: { type: Number, min: 0, required: true },
  amount: { type: Number, min: 0, required: true }
}, { _id: true });

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, min: 0.01, required: true },
  method: { type: String, enum: ['cash', 'bank_transfer', 'card', 'online', 'other'], default: 'bank_transfer' },
  reference: { type: String, trim: true, maxlength: 160, default: '' },
  note: { type: String, trim: true, maxlength: 500, default: '' },
  receivedAt: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerSnapshot: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  billingAddress: { type: String, trim: true, default: '' },
  projectTitle: { type: String, required: true, trim: true, maxlength: 160 },
  projectType: { type: String, trim: true, default: '' },
  lineItems: { type: [lineItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  subtotal: { type: Number, min: 0, required: true },
  discountType: { type: String, enum: ['fixed', 'percent'], default: 'fixed' },
  discountValue: { type: Number, min: 0, default: 0 },
  discountAmount: { type: Number, min: 0, default: 0 },
  taxRate: { type: Number, min: 0, max: 100, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 },
  shippingAmount: { type: Number, min: 0, default: 0 },
  total: { type: Number, min: 0, required: true },
  paidAmount: { type: Number, min: 0, default: 0 },
  balanceDue: { type: Number, min: 0, default: 0 },
  currency: { type: String, trim: true, default: 'PKR' },
  status: { type: String, enum: ['draft', 'issued', 'partially_paid', 'paid', 'void', 'overdue'], default: 'draft', index: true },
  issueDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  notes: { type: String, trim: true, maxlength: 3000, default: '' },
  terms: { type: String, trim: true, maxlength: 5000, default: 'Payment terms are subject to the approved quotation and project agreement.' },
  payments: { type: [paymentSchema], default: [] }
}, { timestamps: true });

invoiceSchema.index({ customer: 1, createdAt: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model('Invoice', invoiceSchema);
