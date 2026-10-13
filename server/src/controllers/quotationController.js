import { notifyCustomer, notifyAdmin } from '../services/emailService.js';
import mongoose from 'mongoose';
import Quotation from '../models/Quotation.js';
import Product from '../models/Product.js';
import { makeQuotationNumber } from '../utils/quotationNumber.js';

const clean = (q) => ({
  id: q._id,
  quotationNumber: q.quotationNumber,
  customer: q.customer,
  customerSnapshot: q.customerSnapshot,
  items: q.items,
  projectTitle: q.projectTitle,
  projectType: q.projectType,
  siteAddress: q.siteAddress,
  preferredTimeline: q.preferredTimeline,
  budgetRange: q.budgetRange,
  customerNotes: q.customerNotes,
  estimatedSubtotal: q.estimatedSubtotal,
  quotedTotal: q.quotedTotal,
  currency: q.currency,
  status: q.status,
  adminNotes: q.adminNotes,
  rejectionReason: q.rejectionReason,
  validUntil: q.validUntil,
  reviewedAt: q.reviewedAt,
  approvedAt: q.approvedAt,
  createdAt: q.createdAt,
  updatedAt: q.updatedAt
});

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('At least one product item is required.');
  return items.map((item) => ({
    product: item.product,
    quantity: Math.max(1, Number(item.quantity) || 1),
    dimensions: {
      length: Math.max(0, Number(item.dimensions?.length) || 0),
      width: Math.max(0, Number(item.dimensions?.width) || 0),
      height: Math.max(0, Number(item.dimensions?.height) || 0),
      unit: String(item.dimensions?.unit || 'ft').trim()
    },
    material: String(item.material || '').trim(),
    finish: String(item.finish || '').trim(),
    notes: String(item.notes || '').trim()
  }));
}

async function hydrateItems(rawItems) {
  const ids = rawItems.map((x) => x.product).filter((id) => mongoose.isValidObjectId(id));
  if (ids.length !== rawItems.length) throw new Error('One or more selected products are invalid.');
  const products = await Product.find({ _id: { $in: ids }, status: 'active' });
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return rawItems.map((item) => {
    const product = byId.get(String(item.product));
    if (!product) throw new Error('One or more selected products are unavailable.');
    const unitPrice = product.priceMode === 'starting' ? Number(product.basePrice || 0) : 0;
    return {
      product: product._id,
      productName: product.name,
      category: product.category,
      quantity: item.quantity,
      unit: product.unit || 'project',
      dimensions: item.dimensions,
      material: item.material,
      finish: item.finish,
      notes: item.notes,
      unitPrice,
      estimatedAmount: Number((unitPrice * item.quantity).toFixed(2))
    };
  });
}

export async function createQuotation(req, res) {
  try {
    const { projectTitle, projectType, siteAddress, preferredTimeline, budgetRange, customerNotes } = req.body;
    if (!String(projectTitle || '').trim()) return res.status(400).json({ message: 'Project title is required.' });
    const rawItems = normalizeItems(req.body.items);
    const items = await hydrateItems(rawItems);
    const estimatedSubtotal = Number(items.reduce((sum, item) => sum + item.estimatedAmount, 0).toFixed(2));
    const quotation = await Quotation.create({
      quotationNumber: makeQuotationNumber(),
      customer: req.user._id,
      customerSnapshot: { name: req.user.name, email: req.user.email, phone: req.user.phone || '' },
      items,
      projectTitle: String(projectTitle).trim(),
      projectType: String(projectType || '').trim(),
      siteAddress: String(siteAddress || '').trim(),
      preferredTimeline: String(preferredTimeline || '').trim(),
      budgetRange: String(budgetRange || '').trim(),
      customerNotes: String(customerNotes || '').trim(),
      estimatedSubtotal
    });
    void notifyCustomer({ to: req.user.email, name: req.user.name, subject: `Quotation request ${quotation.quotationNumber} received`, heading: 'we received your quotation request', message: 'Thank you for sharing your project requirements. Our team will review the details and update you as the request progresses.', details: [{label:'Reference',value:quotation.quotationNumber},{label:'Project',value:quotation.projectTitle},{label:'Status',value:quotation.status}] });
    void notifyAdmin({ subject: `New quotation request ${quotation.quotationNumber}`, heading: 'A new quotation request arrived', message: 'A customer has submitted project requirements for review.', details: [{label:'Reference',value:quotation.quotationNumber},{label:'Customer',value:req.user.name},{label:'Email',value:req.user.email},{label:'Project',value:quotation.projectTitle}] });
    res.status(201).json({ message: 'Quotation request submitted successfully.', quotation: clean(quotation) });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to create quotation.' });
  }
}

export async function listMyQuotations(req, res) {
  const items = await Quotation.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ items: items.map(clean) });
}

export async function getMyQuotation(req, res) {
  const quotation = await Quotation.findOne({ _id: req.params.id, customer: req.user._id });
  if (!quotation) return res.status(404).json({ message: 'Quotation not found.' });
  res.json({ quotation: clean(quotation) });
}

export async function cancelMyQuotation(req, res) {
  const quotation = await Quotation.findOne({ _id: req.params.id, customer: req.user._id });
  if (!quotation) return res.status(404).json({ message: 'Quotation not found.' });
  if (!['submitted', 'under_review', 'needs_information'].includes(quotation.status)) {
    return res.status(409).json({ message: 'This quotation can no longer be cancelled.' });
  }
  quotation.status = 'cancelled';
  await quotation.save();
  res.json({ message: 'Quotation cancelled.', quotation: clean(quotation) });
}

export async function adminListQuotations(req, res) {
  const { status = '', search = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search.trim()) filter.$or = [
    { quotationNumber: { $regex: search.trim(), $options: 'i' } },
    { 'customerSnapshot.name': { $regex: search.trim(), $options: 'i' } },
    { 'customerSnapshot.email': { $regex: search.trim(), $options: 'i' } },
    { projectTitle: { $regex: search.trim(), $options: 'i' } }
  ];
  const items = await Quotation.find(filter).sort({ createdAt: -1 });
  res.json({ items: items.map(clean) });
}

export async function adminGetQuotation(req, res) {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) return res.status(404).json({ message: 'Quotation not found.' });
  res.json({ quotation: clean(quotation) });
}

export async function adminUpdateQuotation(req, res) {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) return res.status(404).json({ message: 'Quotation not found.' });

  const previousStatus = quotation.status;
  const allowed = ['submitted', 'under_review', 'needs_information', 'quoted', 'approved', 'rejected', 'cancelled'];
  if (req.body.status && !allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid quotation status.' });
  if (req.body.quotedTotal !== undefined && req.body.quotedTotal !== null && (Number.isNaN(Number(req.body.quotedTotal)) || Number(req.body.quotedTotal) < 0)) {
    return res.status(400).json({ message: 'Quoted total must be a valid non-negative amount.' });
  }

  if (req.body.status) quotation.status = req.body.status;
  if (req.body.quotedTotal !== undefined) quotation.quotedTotal = req.body.quotedTotal === null || req.body.quotedTotal === '' ? null : Number(req.body.quotedTotal);
  if (req.body.adminNotes !== undefined) quotation.adminNotes = String(req.body.adminNotes).trim();
  if (req.body.rejectionReason !== undefined) quotation.rejectionReason = String(req.body.rejectionReason).trim();
  if (req.body.validUntil) quotation.validUntil = new Date(req.body.validUntil);
  if (['under_review', 'needs_information', 'quoted', 'approved', 'rejected'].includes(quotation.status) && !quotation.reviewedAt) quotation.reviewedAt = new Date();
  if (quotation.status === 'approved') quotation.approvedAt = new Date();
  await quotation.save();
  if (previousStatus !== quotation.status) void notifyCustomer({ to: quotation.customerSnapshot?.email, name: quotation.customerSnapshot?.name, subject: `Quotation ${quotation.quotationNumber} update`, heading: 'your quotation status was updated', message: 'Our team has updated your quotation request. Sign in to your account for the latest details.', details: [{label:'Reference',value:quotation.quotationNumber},{label:'Project',value:quotation.projectTitle},{label:'Status',value:quotation.status},{label:'Quoted total',value:quotation.quotedTotal == null ? '' : `${quotation.currency || 'PKR'} ${quotation.quotedTotal}`},{label:'Team note',value:quotation.adminNotes},{label:'Reason',value:quotation.rejectionReason}] });
  res.json({ message: 'Quotation updated.', quotation: clean(quotation) });
}
