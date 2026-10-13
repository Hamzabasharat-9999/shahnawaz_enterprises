import { notifyCustomer, notifyAdmin } from '../services/emailService.js';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import { makeOrderNumber } from '../utils/orderNumber.js';
import Delivery from '../models/Delivery.js';
import { makeDeliveryNumber } from '../utils/deliveryNumber.js';
import { reserveOrderInventory, releaseOrderInventory, consumeOrderInventory, restoreConsumedInventory } from '../services/inventoryService.js';

const statuses = ['pending_confirmation', 'confirmed', 'in_production', 'quality_check', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'completed', 'cancelled'];
const transitions = {
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['quality_check', 'cancelled'],
  quality_check: ['ready_for_delivery', 'in_production'],
  ready_for_delivery: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
};

const clean = (o) => ({
  id: o._id,
  orderNumber: o.orderNumber,
  quotation: o.quotation,
  customer: o.customer,
  customerSnapshot: o.customerSnapshot,
  items: o.items,
  projectTitle: o.projectTitle,
  projectType: o.projectType,
  siteAddress: o.siteAddress,
  preferredTimeline: o.preferredTimeline,
  customerNotes: o.customerNotes,
  subtotal: o.subtotal,
  total: o.total,
  currency: o.currency,
  status: o.status,
  deliveryNotes: o.deliveryNotes,
  adminNotes: o.adminNotes,
  estimatedDeliveryDate: o.estimatedDeliveryDate,
  deliveredAt: o.deliveredAt,
  completedAt: o.completedAt,
  timeline: o.timeline,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt
});

export async function approveQuotationAndCreateOrder(req, res) {
  try {
    const quotation = await Quotation.findOne({ _id: req.params.id, customer: req.user._id });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found.' });
    if (quotation.status !== 'quoted') return res.status(409).json({ message: 'Only a quoted quotation can be approved.' });
    if (quotation.validUntil && quotation.validUntil < new Date()) return res.status(409).json({ message: 'This quotation has expired.' });
    if (quotation.quotedTotal == null) return res.status(409).json({ message: 'A final quoted amount is required before approval.' });

    const existing = await Order.findOne({ quotation: quotation._id });
    if (existing) return res.status(200).json({ message: 'An order already exists for this quotation.', order: clean(existing) });

    const items = quotation.items.map(item => ({
      product: item.product,
      productName: item.productName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      dimensions: item.dimensions,
      material: item.material,
      finish: item.finish,
      notes: item.notes,
      unitPrice: item.unitPrice || 0,
      amount: item.estimatedAmount || 0
    }));

    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      quotation: quotation._id,
      customer: quotation.customer,
      customerSnapshot: quotation.customerSnapshot,
      items,
      projectTitle: quotation.projectTitle,
      projectType: quotation.projectType,
      siteAddress: quotation.siteAddress,
      preferredTimeline: quotation.preferredTimeline,
      customerNotes: quotation.customerNotes,
      subtotal: quotation.estimatedSubtotal || 0,
      total: quotation.quotedTotal,
      currency: quotation.currency || 'PKR',
      status: 'pending_confirmation',
      timeline: [{ status: 'pending_confirmation', note: 'Order created from approved quotation.', changedBy: req.user._id }]
    });

    await Delivery.create({
      deliveryNumber: makeDeliveryNumber(),
      order: order._id,
      customer: quotation.customer,
      recipientName: quotation.customerSnapshot?.name || 'Customer',
      recipientPhone: quotation.customerSnapshot?.phone || '',
      addressLine1: quotation.siteAddress || 'Address to be confirmed',
      city: 'Other',
      status: 'pending',
      timeline: [{ status: 'pending', note: 'Delivery planning record created with the order.', changedBy: req.user._id }]
    });

    quotation.status = 'approved';
    quotation.approvedAt = new Date();
    quotation.reviewedAt = quotation.reviewedAt || new Date();
    await quotation.save();

    void notifyCustomer({ to: order.customerSnapshot?.email, name: order.customerSnapshot?.name, subject: `Order ${order.orderNumber} created`, heading: 'your project order has been created', message: 'Your approved quotation has been converted into an order. We will email you when the order progresses.', details: [{label:'Order',value:order.orderNumber},{label:'Project',value:order.projectTitle},{label:'Total',value:`${order.currency || 'PKR'} ${order.total}`},{label:'Status',value:order.status}] });
    void notifyAdmin({ subject: `New order ${order.orderNumber}`, heading: 'A new order was created', message: 'An approved quotation has been converted into an order.', details: [{label:'Order',value:order.orderNumber},{label:'Customer',value:order.customerSnapshot?.name},{label:'Email',value:order.customerSnapshot?.email},{label:'Project',value:order.projectTitle}] });
    res.status(201).json({ message: 'Quotation approved and order created.', order: clean(order) });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to create order.' });
  }
}

export async function listMyOrders(req, res) {
  const items = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ items: items.map(clean) });
}

export async function getMyOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order: clean(order) });
}

export async function adminListOrders(req, res) {
  const { status = '', search = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const value = String(search || '').trim();
  if (value) filter.$or = [
    { orderNumber: { $regex: value, $options: 'i' } },
    { 'customerSnapshot.name': { $regex: value, $options: 'i' } },
    { 'customerSnapshot.email': { $regex: value, $options: 'i' } },
    { projectTitle: { $regex: value, $options: 'i' } }
  ];
  const items = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ items: items.map(clean) });
}

export async function adminGetOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order: clean(order) });
}

export async function adminUpdateOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });

  const previousStatus = order.status;
  const nextStatus = req.body.status;
  if (nextStatus && !statuses.includes(nextStatus)) return res.status(400).json({ message: 'Invalid order status.' });
  if (nextStatus && nextStatus !== order.status && !transitions[order.status]?.includes(nextStatus)) {
    return res.status(409).json({ message: `Cannot move an order from ${order.status} to ${nextStatus}.` });
  }

  if (nextStatus && nextStatus !== order.status) {
    if (nextStatus === 'confirmed') {
      await reserveOrderInventory(order, req.user._id);
    }
    if (nextStatus === 'in_production') {
      await consumeOrderInventory(order, req.user._id);
    }
    if (nextStatus === 'cancelled') {
      if (order.status === 'confirmed') await releaseOrderInventory(order, req.user._id);
      if (order.status === 'in_production' || order.status === 'quality_check') await restoreConsumedInventory(order, req.user._id);
    }
    order.status = nextStatus;
    order.timeline.push({
      status: nextStatus,
      note: String(req.body.timelineNote || '').trim(),
      changedBy: req.user._id,
      changedAt: new Date()
    });
    if (nextStatus === 'delivered') order.deliveredAt = new Date();
    if (nextStatus === 'completed') order.completedAt = new Date();
  }
  if (req.body.adminNotes !== undefined) order.adminNotes = String(req.body.adminNotes).trim();
  if (req.body.deliveryNotes !== undefined) order.deliveryNotes = String(req.body.deliveryNotes).trim();
  if (req.body.estimatedDeliveryDate !== undefined) {
    order.estimatedDeliveryDate = req.body.estimatedDeliveryDate ? new Date(req.body.estimatedDeliveryDate) : null;
  }
  if (order.estimatedDeliveryDate && Number.isNaN(order.estimatedDeliveryDate.getTime())) return res.status(400).json({ message: 'Invalid estimated delivery date.' });

  await order.save();
  if (previousStatus !== order.status) void notifyCustomer({ to: order.customerSnapshot?.email, name: order.customerSnapshot?.name, subject: `Order ${order.orderNumber} update`, heading: 'your order status has changed', message: 'Your project has moved to a new stage. We will continue to keep you informed.', details: [{label:'Order',value:order.orderNumber},{label:'Project',value:order.projectTitle},{label:'Status',value:order.status},{label:'Estimated delivery',value:order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : ''},{label:'Team note',value:order.deliveryNotes || order.adminNotes}] });
  res.json({ message: 'Order updated.', order: clean(order) });
}

export { statuses };
