import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  alt: { type: String, trim: true, default: '' },
  publicId: { type: String, trim: true, default: '' },
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  format: { type: String, trim: true, default: '' }
}, { _id: false });
const portfolioProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, trim: true, index: true },
  location: { type: String, trim: true, default: '' },
  year: { type: Number, min: 1900, max: 2200, default: null },
  shortDescription: { type: String, required: true, trim: true, maxlength: 320 },
  description: { type: String, required: true, trim: true },
  images: { type: [imageSchema], default: [] },
  services: { type: [String], default: [] },
  materials: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  featured: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
portfolioProjectSchema.index({ title: 'text', shortDescription: 'text', description: 'text', tags: 'text', category: 'text' });
export default mongoose.model('PortfolioProject', portfolioProjectSchema);
