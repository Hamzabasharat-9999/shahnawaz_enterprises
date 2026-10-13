import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  alt: { type: String, trim: true, default: '' },
  publicId: { type: String, trim: true, default: '' },
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  format: { type: String, trim: true, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  category: { type: String, required: true, trim: true, index: true },
  shortDescription: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, required: true, trim: true },
  priceMode: { type: String, enum: ['quote', 'starting'], default: 'quote' },
  basePrice: { type: Number, min: 0, default: 0 },
  unit: { type: String, trim: true, default: 'project' },
  images: { type: [imageSchema], default: [] },
  specifications: { type: Map, of: String, default: {} },
  tags: { type: [String], default: [] },
  featured: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active', index: true }
}, { timestamps: true });

productSchema.index({ name: 'text', shortDescription: 'text', description: 'text', tags: 'text' });
export default mongoose.model('Product', productSchema);
