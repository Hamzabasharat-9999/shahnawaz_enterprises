export function makeInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SE-INV-${date}-${random}`;
}
