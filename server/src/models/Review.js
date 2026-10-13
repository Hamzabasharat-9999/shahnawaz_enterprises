import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  orderNumber: { type: String, required: true, trim: true },
  projectTitle: { type: String, required: true, trim: true, maxlength: 160 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  body: { type: String, required: true, trim: true, minlength: 20, maxlength: 1800 },
  categories: {
    quality: { type: Number, min: 1, max: 5, default: null },
    service: { type: Number, min: 1, max: 5, default: null },
    communication: { type: Number, min: 1, max: 5, default: null },
    value: { type: Number, min: 1, max: 5, default: null }
  },
  recommend: { type: Boolean, default: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  adminNote: { type: String, trim: true, maxlength: 1200, default: '' },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  moderatedAt: { type: Date, default: null }
}, { timestamps: true });

reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: -1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
