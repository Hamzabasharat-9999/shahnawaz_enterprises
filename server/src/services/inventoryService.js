import InventoryItem from '../models/InventoryItem.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

export async function recordTransaction({ item, type, quantity, beforeOnHand, afterOnHand, beforeReserved, afterReserved, referenceType='manual', referenceId=null, note='', changedBy=null }) {
  return InventoryTransaction.create({
    inventory: item._id,
    type,
    quantity,
    beforeOnHand,
    afterOnHand,
    beforeReserved,
    afterReserved,
    referenceType,
    referenceId,
    note,
    changedBy
  });
}

export async function receiveStock({ inventoryId, quantity, note='', changedBy=null, type='receipt' }) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error('Quantity must be greater than zero.');
  const item = await InventoryItem.findOneAndUpdate(
    { _id: inventoryId, active: true },
    { $inc: { onHand: qty } },
    { new: false }
  );
  if (!item) throw new Error('Inventory item not found.');
  await recordTransaction({ item, type, quantity: qty, beforeOnHand: item.onHand, afterOnHand: item.onHand + qty, beforeReserved: item.reserved, afterReserved: item.reserved, note, changedBy });
  return InventoryItem.findById(inventoryId);
}

export async function removeStock({ inventoryId, quantity, note='', changedBy=null, type='adjustment_out' }) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error('Quantity must be greater than zero.');
  const item = await InventoryItem.findOneAndUpdate(
    { _id: inventoryId, active: true, $expr: { $gte: ['$onHand', { $add: ['$reserved', qty] }] } },
    { $inc: { onHand: -qty } },
    { new: false }
  );
  if (!item) throw new Error('Insufficient available stock or inventory item not found.');
  await recordTransaction({ item, type, quantity: qty, beforeOnHand: item.onHand, afterOnHand: item.onHand - qty, beforeReserved: item.reserved, afterReserved: item.reserved, note, changedBy });
  return InventoryItem.findById(inventoryId);
}

export async function reserveOrderInventory(order, changedBy=null) {
  const requirements = new Map();
  for (const line of order.items || []) {
    if (!line.product) continue;
    const key = String(line.product);
    requirements.set(key, (requirements.get(key) || 0) + Number(line.quantity || 0));
  }
  if (!requirements.size) return { reserved: false, items: [] };

  const products = [...requirements.keys()];
  const inventory = await InventoryItem.find({ product: { $in: products }, active: true });
  const byProduct = new Map(inventory.map(i => [String(i.product), i]));
  const mapped = [...requirements.entries()].filter(([product]) => byProduct.has(product));
  if (!mapped.length) return { reserved: false, items: [] };

  const missing = mapped.filter(([product, qty]) => {
    const item = byProduct.get(product);
    return item.onHand - item.reserved < qty;
  });
  if (missing.length) {
    const names = missing.map(([product]) => byProduct.get(product)?.name || product).join(', ');
    throw new Error(`Insufficient available inventory for: ${names}. Add stock or adjust the order before confirming.`);
  }

  const changed = [];
  for (const [product, qty] of mapped) {
    const item = byProduct.get(product);
    const updated = await InventoryItem.findOneAndUpdate(
      { _id: item._id, active: true, $expr: { $gte: [{ $subtract: ['$onHand', '$reserved'] }, qty] } },
      { $inc: { reserved: qty } },
      { new: false }
    );
    if (!updated) throw new Error(`Inventory changed while reserving ${item.name}. Please retry.`);
    await recordTransaction({ item: updated, type: 'reservation', quantity: qty, beforeOnHand: updated.onHand, afterOnHand: updated.onHand, beforeReserved: updated.reserved, afterReserved: updated.reserved + qty, referenceType: 'order', referenceId: order._id, note: `Reserved for ${order.orderNumber}.`, changedBy });
    changed.push({ inventory: updated._id, quantity: qty });
  }
  return { reserved: changed.length > 0, items: changed };
}

export async function releaseOrderInventory(order, changedBy=null) {
  const transactions = await InventoryTransaction.find({ referenceType: 'order', referenceId: order._id, type: 'reservation' });
  const released = [];
  for (const tx of transactions) {
    const item = await InventoryItem.findOneAndUpdate(
      { _id: tx.inventory, reserved: { $gte: tx.quantity } },
      { $inc: { reserved: -tx.quantity } },
      { new: false }
    );
    if (!item) continue;
    await recordTransaction({ item, type: 'release', quantity: tx.quantity, beforeOnHand: item.onHand, afterOnHand: item.onHand, beforeReserved: item.reserved, afterReserved: item.reserved - tx.quantity, referenceType: 'order', referenceId: order._id, note: `Released reservation for ${order.orderNumber}.`, changedBy });
    released.push(item._id);
  }
  return released;
}

export async function consumeOrderInventory(order, changedBy=null) {
  const reservations = await InventoryTransaction.find({ referenceType: 'order', referenceId: order._id, type: 'reservation' });
  if (!reservations.length) return [];
  const consumed = [];
  for (const tx of reservations) {
    const item = await InventoryItem.findOneAndUpdate(
      { _id: tx.inventory, onHand: { $gte: tx.quantity }, reserved: { $gte: tx.quantity } },
      { $inc: { onHand: -tx.quantity, reserved: -tx.quantity } },
      { new: false }
    );
    if (!item) throw new Error(`Unable to consume inventory for ${item?.name || tx.inventory}.`);
    await recordTransaction({ item, type: 'consumption', quantity: tx.quantity, beforeOnHand: item.onHand, afterOnHand: item.onHand - tx.quantity, beforeReserved: item.reserved, afterReserved: item.reserved - tx.quantity, referenceType: 'order', referenceId: order._id, note: `Consumed for production of ${order.orderNumber}.`, changedBy });
    consumed.push(item._id);
  }
  return consumed;
}

export async function restoreConsumedInventory(order, changedBy=null) {
  const transactions = await InventoryTransaction.find({ referenceType: 'order', referenceId: order._id, type: 'consumption' });
  const restored = [];
  for (const tx of transactions) {
    const item = await InventoryItem.findByIdAndUpdate(tx.inventory, { $inc: { onHand: tx.quantity } }, { new: false });
    if (!item) continue;
    await recordTransaction({ item, type: 'return', quantity: tx.quantity, beforeOnHand: item.onHand, afterOnHand: item.onHand + tx.quantity, beforeReserved: item.reserved, afterReserved: item.reserved, referenceType: 'order', referenceId: order._id, note: `Restored inventory after cancellation of ${order.orderNumber}.`, changedBy });
    restored.push(item._id);
  }
  return restored;
}
