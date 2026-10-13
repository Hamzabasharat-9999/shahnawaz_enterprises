export function makeDeliveryNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `SE-DLV-${date}-${suffix}`;
}
