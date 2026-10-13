import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  type: { type: String, enum: ['material', 'product', 'component', 'supply'], default: 'material', index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
  category: { type: String, trim: true, default: '' },
  unit: { type: String, trim: true, default: 'unit' },
  location: { type: String, trim: true, default: 'Main Store' },
  onHand: { type: Number, min: 0, default: 0 },
  reserved: { type: Number, min: 0, default: 0 },
  reorderLevel: { type: Number, min: 0, default: 0 },
  reorderQuantity: { type: Number, min: 0, default: 0 },
  costPerUnit: { type: Number, min: 0, default: 0 },
  supplier: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

inventoryItemSchema.virtual('available').get(function () {
  return Math.max(this.onHand - this.reserved, 0);
});

inventoryItemSchema.virtual('lowStock').get(function () {
  return this.active && this.onHand <= this.reorderLevel;
});

inventoryItemSchema.index({ active: 1, category: 1 });

export default mongoose.model('InventoryItem', inventoryItemSchema);
