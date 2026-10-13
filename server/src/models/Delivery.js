import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, trim: true, default: '' },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const deliverySchema = new mongoose.Schema({
  deliveryNumber: { type: String, required: true, unique: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipientName: { type: String, required: true, trim: true, maxlength: 120 },
  recipientPhone: { type: String, trim: true, default: '', maxlength: 40 },
  addressLine1: { type: String, required: true, trim: true, maxlength: 240 },
  addressLine2: { type: String, trim: true, default: '', maxlength: 240 },
  area: { type: String, trim: true, default: '', maxlength: 120 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, trim: true, default: '', maxlength: 30 },
  landmark: { type: String, trim: true, default: '', maxlength: 180 },
  latitude: { type: Number, min: -90, max: 90, default: null },
  longitude: { type: Number, min: -180, max: 180, default: null },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'assigned', 'out_for_delivery', 'delivered', 'failed', 'cancelled'],
    default: 'pending', index: true
  },
  scheduledDate: { type: Date, default: null },
  timeWindow: { type: String, trim: true, default: '' },
  assignedTo: { type: String, trim: true, default: '', maxlength: 120 },
  vehicle: { type: String, trim: true, default: '', maxlength: 120 },
  customerInstructions: { type: String, trim: true, default: '', maxlength: 2000 },
  adminNotes: { type: String, trim: true, default: '', maxlength: 3000 },
  deliveredAt: { type: Date, default: null },
  failureReason: { type: String, trim: true, default: '', maxlength: 1000 },
  timeline: { type: [timelineSchema], default: [] }
}, { timestamps: true });

deliverySchema.index({ customer: 1, createdAt: -1 });
deliverySchema.index({ status: 1, scheduledDate: 1 });

export default mongoose.model('Delivery', deliverySchema);
