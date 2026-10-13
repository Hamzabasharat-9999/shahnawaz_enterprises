import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerSnapshot: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' }
  },
  type: { type: String, required: true, trim: true, index: true },
  typeLabel: { type: String, required: true, trim: true },
  durationMinutes: { type: Number, required: true, min: 15, max: 240 },
  dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, index: true },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  slotKeys: { type: [String], required: true },
  preferredMode: { type: String, enum: ['in_person', 'phone', 'video'], default: 'in_person' },
  projectTitle: { type: String, trim: true, maxlength: 160, default: '' },
  projectType: { type: String, trim: true, maxlength: 100, default: '' },
  siteAddress: { type: String, trim: true, maxlength: 500, default: '' },
  notes: { type: String, trim: true, maxlength: 3000, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rejected'], default: 'pending', index: true },
  adminNotes: { type: String, trim: true, maxlength: 3000, default: '' },
  cancellationReason: { type: String, trim: true, maxlength: 1000, default: '' },
  confirmedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

appointmentSchema.index(
  { slotKeys: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);
appointmentSchema.index({ customer: 1, createdAt: -1 });
appointmentSchema.index({ dateKey: 1, startTime: 1 });

export default mongoose.model('Appointment', appointmentSchema);
