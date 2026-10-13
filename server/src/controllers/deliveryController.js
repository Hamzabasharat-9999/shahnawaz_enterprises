import { notifyCustomer } from '../services/emailService.js';
import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import { configForClient, DELIVERY_CONFIG } from '../config/deliveryConfig.js';
import { deliveryTransitions, mapsUrl, normaliseAddress } from '../services/deliveryService.js';
import { makeDeliveryNumber } from '../utils/deliveryNumber.js';

const clean = d => ({
  id: d._id, deliveryNumber: d.deliveryNumber, order: d.order, customer: d.customer,
  recipientName: d.recipientName, recipientPhone: d.recipientPhone,
  addressLine1: d.addressLine1, addressLine2: d.addressLine2, area: d.area, city: d.city,
  postalCode: d.postalCode, landmark: d.landmark, latitude: d.latitude, longitude: d.longitude,
  status: d.status, scheduledDate: d.scheduledDate, timeWindow: d.timeWindow,
  assignedTo: d.assignedTo, vehicle: d.vehicle, customerInstructions: d.customerInstructions,
  adminNotes: d.adminNotes, deliveredAt: d.deliveredAt, failureReason: d.failureReason,
  timeline: d.timeline, mapsUrl: mapsUrl(d), createdAt: d.createdAt, updatedAt: d.updatedAt
});

export function getDeliveryConfig(req, res) { res.json(configForClient()); }

export async function getMyDelivery(req, res) {
  const order = await Order.findOne({ _id: req.params.orderId, customer: req.user._id }).select('_id orderNumber projectTitle siteAddress');
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  const delivery = await Delivery.findOne({ order: order._id });
  if (!delivery) return res.status(404).json({ message: 'Delivery record has not been created yet.' });
  res.json({ delivery: clean(delivery), order: { id: order._id, orderNumber: order.orderNumber, projectTitle: order.projectTitle, siteAddress: order.siteAddress } });
}

export async function updateMyDeliveryAddress(req, res) {
  const order = await Order.findOne({ _id: req.params.orderId, customer: req.user._id }).select('_id status siteAddress');
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (['out_for_delivery', 'delivered', 'completed', 'cancelled'].includes(order.status)) {
    return res.status(409).json({ message: 'The delivery address can no longer be changed for this order.' });
  }
  let address;
  try { address = normaliseAddress(req.body); } catch (error) { return res.status(400).json({ message: error.message }); }
  if (!address.recipientName || !address.addressLine1 || !address.city) return res.status(400).json({ message: 'Recipient name, address and city are required.' });
  const delivery = await Delivery.findOne({ order: order._id });
  if (!delivery) return res.status(404).json({ message: 'Delivery record has not been created yet.' });
  Object.assign(delivery, address);
  await delivery.save();
  order.siteAddress = [address.addressLine1, address.addressLine2, address.area, address.city, address.postalCode].filter(Boolean).join(', ');
  await order.save();
  res.json({ message: 'Delivery location updated.', delivery: clean(delivery) });
}

export async function adminListDeliveries(req, res) {
  const { status = '', date = '', search = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) {
    const start = new Date(`${date}T00:00:00`); const end = new Date(`${date}T23:59:59.999`);
    if (!Number.isNaN(start.getTime())) filter.scheduledDate = { $gte: start, $lte: end };
  }
  const value = String(search || '').trim();
  let items = await Delivery.find(filter).sort({ scheduledDate: 1, createdAt: -1 }).populate('order', 'orderNumber projectTitle total currency status').lean();
  if (value) {
    const q = value.toLowerCase();
    items = items.filter(d => [d.deliveryNumber, d.recipientName, d.recipientPhone, d.city, d.area, d.order?.orderNumber, d.order?.projectTitle].some(x => String(x || '').toLowerCase().includes(q)));
  }
  res.json({ items: items.map(clean) });
}

export async function adminGetDelivery(req, res) {
  const delivery = await Delivery.findById(req.params.id).populate('order', 'orderNumber projectTitle total currency status customerSnapshot').lean();
  if (!delivery) return res.status(404).json({ message: 'Delivery not found.' });
  res.json({ delivery: clean(delivery) });
}

export async function adminCreateMissingDelivery(req, res) {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  const existing = await Delivery.findOne({ order: order._id });
  if (existing) return res.json({ message: 'Delivery already exists.', delivery: clean(existing) });
  let address;
  try { address = normaliseAddress({
    recipientName: order.customerSnapshot?.name, recipientPhone: order.customerSnapshot?.phone,
    addressLine1: order.siteAddress || '', city: 'Other'
  }); } catch (error) { return res.status(400).json({ message: error.message }); }
  if (!address.addressLine1) return res.status(400).json({ message: 'Add a site address to the order before creating delivery.' });
  const delivery = await Delivery.create({ deliveryNumber: makeDeliveryNumber(), order: order._id, customer: order.customer, ...address, status: 'pending', timeline: [{ status: 'pending', note: 'Delivery record created by administrator.', changedBy: req.user._id }] });
  res.status(201).json({ message: 'Delivery record created.', delivery: clean(delivery) });
}

export async function adminUpdateDelivery(req, res) {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) return res.status(404).json({ message: 'Delivery not found.' });
  const previousStatus = delivery.status;
  const nextStatus = req.body.status;
  if (nextStatus && !DELIVERY_CONFIG.statuses.includes(nextStatus)) return res.status(400).json({ message: 'Invalid delivery status.' });
  if (nextStatus && nextStatus !== delivery.status && !deliveryTransitions[delivery.status]?.includes(nextStatus)) return res.status(409).json({ message: `Cannot move delivery from ${delivery.status} to ${nextStatus}.` });

  if (nextStatus && nextStatus !== delivery.status) {
    delivery.status = nextStatus;
    delivery.timeline.push({ status: nextStatus, note: String(req.body.timelineNote || '').trim(), changedBy: req.user._id, changedAt: new Date() });
    if (nextStatus === 'delivered') delivery.deliveredAt = new Date();
  }
  const addressKeys = ['recipientName','recipientPhone','addressLine1','addressLine2','area','city','postalCode','landmark','latitude','longitude'];
  if (addressKeys.some(k => Object.prototype.hasOwnProperty.call(req.body, k))) {
    try { Object.assign(delivery, normaliseAddress({ ...delivery.toObject(), ...req.body })); } catch (error) { return res.status(400).json({ message: error.message }); }
  }
  for (const key of ['timeWindow','assignedTo','vehicle','customerInstructions','adminNotes','failureReason']) if (req.body[key] !== undefined) delivery[key] = String(req.body[key]).trim();
  if (req.body.scheduledDate !== undefined) delivery.scheduledDate = req.body.scheduledDate ? new Date(req.body.scheduledDate) : null;
  if (delivery.scheduledDate && Number.isNaN(delivery.scheduledDate.getTime())) return res.status(400).json({ message: 'Invalid scheduled delivery date.' });
  if (!delivery.recipientName || !delivery.addressLine1 || !delivery.city) return res.status(400).json({ message: 'Recipient name, address and city are required.' });
  await delivery.save();

  const order = await Order.findById(delivery.order);
  if (order) {
    if (nextStatus === 'out_for_delivery' && ['ready_for_delivery'].includes(order.status)) {
      order.status = 'out_for_delivery';
      order.timeline.push({ status: 'out_for_delivery', note: 'Delivery dispatched.', changedBy: req.user._id });
    }
    if (nextStatus === 'delivered' && ['out_for_delivery','ready_for_delivery'].includes(order.status)) {
      order.status = 'delivered'; order.deliveredAt = new Date();
      order.timeline.push({ status: 'delivered', note: 'Delivery marked as delivered.', changedBy: req.user._id });
    }
    await order.save();
  }
  if (previousStatus !== delivery.status) {
    const orderForEmail = await Order.findById(delivery.order);
    void notifyCustomer({ to: orderForEmail?.customerSnapshot?.email, name: delivery.recipientName, subject: `Delivery ${delivery.deliveryNumber} update`, heading: 'your delivery status has changed', message: 'The delivery team has updated your delivery information.', details: [{label:'Delivery reference',value:delivery.deliveryNumber},{label:'Order',value:orderForEmail?.orderNumber},{label:'Status',value:delivery.status},{label:'Scheduled date',value:delivery.scheduledDate ? new Date(delivery.scheduledDate).toLocaleDateString() : ''},{label:'City',value:delivery.city},{label:'Team note',value:delivery.adminNotes || delivery.failureReason}] });
  }
  res.json({ message: 'Delivery updated.', delivery: clean(delivery) });
}

export async function adminDeleteDelivery(req, res) {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) return res.status(404).json({ message: 'Delivery not found.' });
  if (!['pending','cancelled'].includes(delivery.status)) return res.status(409).json({ message: 'Only pending or cancelled delivery records can be removed.' });
  await delivery.deleteOne();
  res.json({ message: 'Delivery record removed.' });
}
