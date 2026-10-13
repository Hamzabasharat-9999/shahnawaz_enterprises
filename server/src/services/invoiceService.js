export function calculateInvoiceTotals({ lineItems = [], discountType = 'fixed', discountValue = 0, taxRate = 0, shippingAmount = 0 }) {
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const safeDiscountValue = Math.max(0, Number(discountValue || 0));
  const discountAmount = discountType === 'percent'
    ? Math.min(subtotal, subtotal * safeDiscountValue / 100)
    : Math.min(subtotal, safeDiscountValue);
  const taxable = Math.max(0, subtotal - discountAmount);
  const safeTaxRate = Math.max(0, Math.min(100, Number(taxRate || 0)));
  const taxAmount = taxable * safeTaxRate / 100;
  const shipping = Math.max(0, Number(shippingAmount || 0));
  const total = Math.max(0, taxable + taxAmount + shipping);
  return { subtotal, discountAmount, taxAmount, shippingAmount: shipping, total };
}

export function deriveInvoiceStatus({ currentStatus, total, paidAmount, dueDate }) {
  if (currentStatus === 'void') return 'void';
  const paid = Number(paidAmount || 0);
  const grand = Number(total || 0);
  if (grand > 0 && paid >= grand) return 'paid';
  if (paid > 0) return 'partially_paid';
  if (currentStatus === 'issued' && dueDate && new Date(dueDate) < new Date()) return 'overdue';
  return currentStatus === 'draft' ? 'draft' : 'issued';
}
