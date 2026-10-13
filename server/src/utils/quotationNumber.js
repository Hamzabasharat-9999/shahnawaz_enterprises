import crypto from 'crypto';

export function makeQuotationNumber() {
  const date = new Date();
  const stamp = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('');
  return `SE-Q-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
