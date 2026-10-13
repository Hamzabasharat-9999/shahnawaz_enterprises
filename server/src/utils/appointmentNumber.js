export function makeAppointmentNumber() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `AP-${stamp}-${suffix}`;
}
