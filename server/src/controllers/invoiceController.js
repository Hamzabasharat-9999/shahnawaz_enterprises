import { notifyCustomer } from '../services/emailService.js';
import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import { makeInvoiceNumber } from '../utils/invoiceNumber.js';
import { calculateInvoiceTotals, deriveInvoiceStatus } from '../services/invoiceService.js';

const clean = (invoice) => ({
  id: invoice._id,
  invoiceNumber: invoice.invoiceNumber,
  order: invoice.order,
  quotation: invoice.quotation,
  customer: invoice.customer,
  customerSnapshot: invoice.customerSnapshot,
  billingAddress: invoice.billingAddress,
  projectTitle: invoice.projectTitle,
  projectType: invoice.projectType,
  lineItems: invoice.lineItems,
  subtotal: invoice.subtotal,
  discountType: invoice.discountType,
  discountValue: invoice.discountValue,
  discountAmount: invoice.discountAmount,
  taxRate: invoice.taxRate,
  taxAmount: invoice.taxAmount,
  shippingAmount: invoice.shippingAmount,
  total: invoice.total,
  paidAmount: invoice.paidAmount,
  balanceDue: invoice.balanceDue,
  currency: invoice.currency,
  status: invoice.status,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  notes: invoice.notes,
  terms: invoice.terms,
  payments: invoice.payments,
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt
});

function validId(id) { return mongoose.Types.ObjectId.isValid(id); }

function buildLineItems(order) {
  return order.items.map(item => ({
    product: item.product,
    description: item.productName,
    quantity: item.quantity,
    unit: item.unit || 'unit',
    unitPrice: item.unitPrice || 0,
    amount: item.amount || 0
  }));
}

export async function listMyInvoices(req, res) {
  const invoices = await Invoice.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ items: invoices.map(clean) });
}

export async function getMyInvoice(req, res) {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Invoice not found.' });
  const invoice = await Invoice.findOne({ _id: req.params.id, customer: req.user._id });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
  res.json({ invoice: clean(invoice) });
}

export async function adminListInvoices(req, res) {
  const { status = '', search = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const value = String(search || '').trim();
  if (value) filter.$or = [
    { invoiceNumber: { $regex: value, $options: 'i' } },
    { projectTitle: { $regex: value, $options: 'i' } },
    { 'customerSnapshot.name': { $regex: value, $options: 'i' } },
    { 'customerSnapshot.email': { $regex: value, $options: 'i' } }
  ];
  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
  res.json({ items: invoices.map(clean) });
}

export async function adminGetInvoice(req, res) {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Invoice not found.' });
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
  res.json({ invoice: clean(invoice) });
}

export async function adminCreateInvoiceFromOrder(req, res) {
  if (!validId(req.params.orderId)) return res.status(404).json({ message: 'Order not found.' });
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  const existing = await Invoice.findOne({ order: order._id });
  if (existing) return res.status(200).json({ message: 'Invoice already exists for this order.', invoice: clean(existing) });

  const lineItems = buildLineItems(order);
  const discountType = req.body.discountType === 'percent' ? 'percent' : 'fixed';
  const totals = calculateInvoiceTotals({ lineItems, discountType, discountValue: req.body.discountValue, taxRate: req.body.taxRate, shippingAmount: req.body.shippingAmount });
  const issueNow = req.body.issueNow !== false;
  const issueDate = issueNow ? new Date() : null;
  const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) return res.status(400).json({ message: 'Invalid due date.' });

  const invoice = await Invoice.create({
    invoiceNumber: makeInvoiceNumber(),
    order: order._id,
    quotation: order.quotation,
    customer: order.customer,
    customerSnapshot: {
      name: order.customerSnapshot.name,
      email: order.customerSnapshot.email,
      phone: order.customerSnapshot.phone || '',
      address: order.siteAddress || ''
    },
    billingAddress: order.siteAddress || '',
    projectTitle: order.projectTitle,
    projectType: order.projectType || '',
    lineItems,
    subtotal: totals.subtotal,
    discountType,
    discountValue: Number(req.body.discountValue || 0),
    discountAmount: totals.discountAmount,
    taxRate: Number(req.body.taxRate || 0),
    taxAmount: totals.taxAmount,
    shippingAmount: totals.shippingAmount,
    total: totals.total,
    paidAmount: 0,
    balanceDue: totals.total,
    currency: order.currency || 'PKR',
    status: issueNow ? 'issued' : 'draft',
    issueDate,
    dueDate,
    notes: String(req.body.notes || '').trim(),
    terms: String(req.body.terms || '').trim() || 'Payment terms are subject to the approved quotation and project agreement.'
  });
  if (issueNow) void notifyCustomer({ to: invoice.customerSnapshot?.email, name: invoice.customerSnapshot?.name, subject: `Invoice ${invoice.invoiceNumber} issued`, heading: 'your project invoice is ready', message: 'An invoice has been issued for your project. Please review the balance and due date in your account.', details: [{label:'Invoice',value:invoice.invoiceNumber},{label:'Project',value:invoice.projectTitle},{label:'Total',value:`${invoice.currency || 'PKR'} ${invoice.total}`},{label:'Balance due',value:`${invoice.currency || 'PKR'} ${invoice.balanceDue}`},{label:'Due date',value:invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}] });
  res.status(201).json({ message: 'Invoice created.', invoice: clean(invoice) });
}

export async function adminUpdateInvoice(req, res) {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Invoice not found.' });
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
  if (invoice.status === 'void' && req.body.status !== 'void') return res.status(409).json({ message: 'A void invoice cannot be reopened.' });

  if (req.body.status && !['draft', 'issued', 'void'].includes(req.body.status)) return res.status(400).json({ message: 'Use payment actions to change paid status.' });
  if (req.body.status === 'void') invoice.status = 'void';
  if (req.body.notes !== undefined) invoice.notes = String(req.body.notes).trim();
  if (req.body.terms !== undefined) invoice.terms = String(req.body.terms).trim();
  if (req.body.dueDate !== undefined) {
    const due = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if (due && Number.isNaN(due.getTime())) return res.status(400).json({ message: 'Invalid due date.' });
    invoice.dueDate = due;
  }
  if (req.body.discountType !== undefined || req.body.discountValue !== undefined || req.body.taxRate !== undefined || req.body.shippingAmount !== undefined) {
    const discountType = req.body.discountType === 'percent' ? 'percent' : (invoice.discountType || 'fixed');
    const discountValue = req.body.discountValue !== undefined ? Number(req.body.discountValue) : invoice.discountValue;
    const taxRate = req.body.taxRate !== undefined ? Number(req.body.taxRate) : invoice.taxRate;
    const shippingAmount = req.body.shippingAmount !== undefined ? Number(req.body.shippingAmount) : invoice.shippingAmount;
    const totals = calculateInvoiceTotals({ lineItems: invoice.lineItems, discountType, discountValue, taxRate, shippingAmount });
    invoice.discountType = discountType;
    invoice.discountValue = discountValue;
    invoice.discountAmount = totals.discountAmount;
    invoice.taxRate = taxRate;
    invoice.taxAmount = totals.taxAmount;
    invoice.shippingAmount = totals.shippingAmount;
    invoice.subtotal = totals.subtotal;
    invoice.total = totals.total;
    invoice.balanceDue = Math.max(0, totals.total - invoice.paidAmount);
  }
  if (req.body.status === 'issued' && !invoice.issueDate) invoice.issueDate = new Date();
  if (invoice.status !== 'void') invoice.status = deriveInvoiceStatus({ currentStatus: req.body.status === 'issued' ? 'issued' : invoice.status, total: invoice.total, paidAmount: invoice.paidAmount, dueDate: invoice.dueDate });
  await invoice.save();
  res.json({ message: 'Invoice updated.', invoice: clean(invoice) });
}

export async function adminAddPayment(req, res) {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Invoice not found.' });
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
  if (invoice.status === 'void') return res.status(409).json({ message: 'Cannot record payment on a void invoice.' });
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Payment amount must be greater than zero.' });
  const remaining = Math.max(0, invoice.total - invoice.paidAmount);
  if (amount > remaining + 0.01) return res.status(400).json({ message: `Payment exceeds the remaining balance of ${invoice.currency} ${remaining.toLocaleString()}.` });
  invoice.payments.push({ amount, method: req.body.method || 'bank_transfer', reference: String(req.body.reference || '').trim(), note: String(req.body.note || '').trim(), receivedAt: req.body.receivedAt ? new Date(req.body.receivedAt) : new Date(), recordedBy: req.user._id });
  invoice.paidAmount += amount;
  invoice.balanceDue = Math.max(0, invoice.total - invoice.paidAmount);
  invoice.status = deriveInvoiceStatus({ currentStatus: invoice.status === 'draft' ? 'issued' : invoice.status, total: invoice.total, paidAmount: invoice.paidAmount, dueDate: invoice.dueDate });
  if (!invoice.issueDate) invoice.issueDate = new Date();
  await invoice.save();
  void notifyCustomer({ to: invoice.customerSnapshot?.email, name: invoice.customerSnapshot?.name, subject: `Payment recorded for ${invoice.invoiceNumber}`, heading: 'your payment has been recorded', message: 'Thank you. The latest payment and remaining balance are shown below.', details: [{label:'Invoice',value:invoice.invoiceNumber},{label:'Payment received',value:`${invoice.currency || 'PKR'} ${amount}`},{label:'Paid to date',value:`${invoice.currency || 'PKR'} ${invoice.paidAmount}`},{label:'Balance due',value:`${invoice.currency || 'PKR'} ${invoice.balanceDue}`},{label:'Status',value:invoice.status}] });
  res.json({ message: 'Payment recorded.', invoice: clean(invoice) });
}

export { clean };
