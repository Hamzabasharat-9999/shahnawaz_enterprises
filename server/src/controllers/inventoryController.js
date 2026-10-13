import InventoryItem from '../models/InventoryItem.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Product from '../models/Product.js';
import { receiveStock, removeStock } from '../services/inventoryService.js';

const clean = (item) => ({
  id: item._id,
  sku: item.sku,
  name: item.name,
  type: item.type,
  product: item.product,
  category: item.category,
  unit: item.unit,
  location: item.location,
  onHand: item.onHand,
  reserved: item.reserved,
  available: Math.max(item.onHand - item.reserved, 0),
  reorderLevel: item.reorderLevel,
  reorderQuantity: item.reorderQuantity,
  costPerUnit: item.costPerUnit,
  supplier: item.supplier,
  notes: item.notes,
  active: item.active,
  lowStock: item.active && item.onHand <= item.reorderLevel,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

export const inventoryStatuses = ['active', 'inactive'];
export const inventoryTypes = ['material', 'product', 'component', 'supply'];

export async function getInventorySummary(req, res) {
  const [items, lowStock, valueAgg, transactionCount] = await Promise.all([
    InventoryItem.countDocuments({ active: true }),
    InventoryItem.countDocuments({ active: true, $expr: { $lte: ['$onHand', '$reorderLevel'] } }),
    InventoryItem.aggregate([{ $match: { active: true } }, { $group: { _id: null, value: { $sum: { $multiply: ['$onHand', '$costPerUnit'] } } } }]),
    InventoryTransaction.countDocuments()
  ]);
  res.json({ summary: { items, lowStock, inventoryValue: valueAgg[0]?.value || 0, transactionCount } });
}

export async function listInventory(req, res) {
  const { search = '', type = '', lowStock = '', active = 'true' } = req.query;
  const filter = {};
  if (active !== 'all') filter.active = active === 'true';
  if (type) filter.type = type;
  if (lowStock === 'true') filter.$expr = { $lte: ['$onHand', '$reorderLevel'] };
  const value = String(search).trim();
  if (value) filter.$or = [
    { sku: { $regex: value, $options: 'i' } },
    { name: { $regex: value, $options: 'i' } },
    { category: { $regex: value, $options: 'i' } },
    { location: { $regex: value, $options: 'i' } },
    { supplier: { $regex: value, $options: 'i' } }
  ];
  const items = await InventoryItem.find(filter).populate('product', 'name slug').sort({ active: -1, name: 1 });
  res.json({ items: items.map(clean) });
}

export async function listProductsForInventory(req, res) {
  const products = await Product.find({ status: { $ne: 'archived' } }).select('name category unit slug').sort({ name: 1 });
  res.json({ items: products.map(p => ({ id: p._id, name: p.name, category: p.category, unit: p.unit, slug: p.slug })) });
}

export async function createInventory(req, res) {
  const body = req.body || {};
  const payload = {
    sku: String(body.sku || '').trim().toUpperCase(),
    name: String(body.name || '').trim(),
    type: body.type || 'material',
    product: body.product || null,
    category: String(body.category || '').trim(),
    unit: String(body.unit || 'unit').trim(),
    location: String(body.location || 'Main Store').trim(),
    onHand: Math.max(Number(body.onHand) || 0, 0),
    reserved: 0,
    reorderLevel: Math.max(Number(body.reorderLevel) || 0, 0),
    reorderQuantity: Math.max(Number(body.reorderQuantity) || 0, 0),
    costPerUnit: Math.max(Number(body.costPerUnit) || 0, 0),
    supplier: String(body.supplier || '').trim(),
    notes: String(body.notes || '').trim(),
    active: body.active !== false
  };
  if (!payload.sku || !payload.name) return res.status(400).json({ message: 'SKU and name are required.' });
  if (payload.product) {
    const product = await Product.findById(payload.product);
    if (!product) return res.status(400).json({ message: 'Linked product not found.' });
    const existingLink = await InventoryItem.findOne({ product: payload.product, active: true });
    if (existingLink) return res.status(409).json({ message: 'This product is already linked to an active inventory item.' });
  }
  const item = await InventoryItem.create(payload);
  if (payload.onHand > 0) {
    await InventoryTransaction.create({ inventory: item._id, type: 'opening', quantity: payload.onHand, beforeOnHand: 0, afterOnHand: payload.onHand, beforeReserved: 0, afterReserved: 0, referenceType: 'manual', note: 'Opening inventory balance.', changedBy: req.user._id });
  }
  res.status(201).json({ message: 'Inventory item created.', item: clean(item) });
}

export async function updateInventory(req, res) {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Inventory item not found.' });
  const allowed = ['sku','name','type','product','category','unit','location','reorderLevel','reorderQuantity','costPerUnit','supplier','notes','active'];
  for (const key of allowed) if (req.body[key] !== undefined) item[key] = key === 'sku' ? String(req.body[key]).trim().toUpperCase() : req.body[key];
  if (item.product) {
    const duplicate = await InventoryItem.findOne({ product: item.product, active: true, _id: { $ne: item._id } });
    if (duplicate) return res.status(409).json({ message: 'Another active inventory item is already linked to this product.' });
  }
  await item.save();
  res.json({ message: 'Inventory item updated.', item: clean(item) });
}

export async function archiveInventory(req, res) {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Inventory item not found.' });
  if (item.reserved > 0) return res.status(409).json({ message: 'Cannot archive inventory with reserved stock.' });
  item.active = false;
  await item.save();
  res.json({ message: 'Inventory item archived.' });
}

export async function adjustInventory(req, res) {
  const item = await InventoryItem.findById(req.params.id);
  if (!item || !item.active) return res.status(404).json({ message: 'Active inventory item not found.' });
  const quantity = Number(req.body.quantity);
  const direction = req.body.direction === 'out' ? 'out' : 'in';
  const note = String(req.body.note || '').trim();
  if (!Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than zero.' });
  const updated = direction === 'in'
    ? await receiveStock({ inventoryId: item._id, quantity, note, changedBy: req.user._id, type: 'adjustment_in' })
    : await removeStock({ inventoryId: item._id, quantity, note, changedBy: req.user._id, type: 'adjustment_out' });
  res.json({ message: `Stock adjusted ${direction === 'in' ? 'in' : 'out'}.`, item: clean(updated) });
}

export async function listTransactions(req, res) {
  const filter = req.params.id ? { inventory: req.params.id } : {};
  const items = await InventoryTransaction.find(filter).populate('inventory', 'sku name unit').populate('changedBy', 'name email').sort({ createdAt: -1 }).limit(100).lean();
  res.json({ items });
}
