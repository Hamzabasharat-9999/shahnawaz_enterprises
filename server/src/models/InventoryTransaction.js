import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
  type: { type: String, enum: ['opening', 'receipt', 'adjustment_in', 'adjustment_out', 'reservation', 'release', 'consumption', 'return'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  beforeOnHand: { type: Number, min: 0, required: true },
  afterOnHand: { type: Number, min: 0, required: true },
  beforeReserved: { type: Number, min: 0, required: true },
  afterReserved: { type: Number, min: 0, required: true },
  referenceType: { type: String, enum: ['order', 'manual', 'system'], default: 'manual' },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  note: { type: String, trim: true, maxlength: 1000, default: '' },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

inventoryTransactionSchema.index({ createdAt: -1 });

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
