import { APPOINTMENT_CONFIG, getAppointmentType } from '../config/appointmentConfig.js';

const toMinutes = value => {
  const [h, m] = String(value).split(':').map(Number);
  return h * 60 + m;
};
const pad = value => String(value).padStart(2, '0');
export const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(dateKey) {
  if (!dateKeyRegex.test(dateKey)) return false;
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function dayOfWeek(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APPOINTMENT_CONFIG.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function currentLocalParts() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: APPOINTMENT_CONFIG.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const get = key => parts.find(part => part.type === key)?.value;
  return { dateKey: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function violatesNoticeWindow(dateKey, startTime) {
  const now = currentLocalParts();
  if (dateKey !== now.dateKey) return false;
  return toMinutes(startTime) < now.minutes + APPOINTMENT_CONFIG.minNoticeHours * 60;
}

export function slotKeysFor(dateKey, startTime, durationMinutes) {
  const start = toMinutes(startTime);
  const count = Math.ceil(durationMinutes / APPOINTMENT_CONFIG.slotMinutes);
  return Array.from({ length: count }, (_, i) => {
    const minute = start + i * APPOINTMENT_CONFIG.slotMinutes;
    return `${dateKey}T${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;
  });
}

export function buildSlots(dateKey, typeKey, bookedSlotKeys = new Set()) {
  const type = getAppointmentType(typeKey);
  if (!type) return [];
  const start = toMinutes(APPOINTMENT_CONFIG.workingHours.start);
  const end = toMinutes(APPOINTMENT_CONFIG.workingHours.end);
  const breakStart = toMinutes(APPOINTMENT_CONFIG.break.start);
  const breakEnd = toMinutes(APPOINTMENT_CONFIG.break.end);
  const slots = [];
  for (let minute = start; minute + type.durationMinutes <= end; minute += APPOINTMENT_CONFIG.slotMinutes) {
    const endMinute = minute + type.durationMinutes;
    if (minute < breakEnd && endMinute > breakStart) continue;
    const time = `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;
    const keys = slotKeysFor(dateKey, time, type.durationMinutes);
    const booked = keys.some(key => bookedSlotKeys.has(key)) || violatesNoticeWindow(dateKey, time);
    slots.push({ startTime: time, endTime: `${pad(Math.floor(endMinute / 60))}:${pad(endMinute % 60)}`, durationMinutes: type.durationMinutes, available: !booked, slotKeys: keys });
  }
  return slots;
}

export function validateDateAndTime({ dateKey, startTime, durationMinutes }) {
  if (!isValidDateKey(dateKey)) throw new Error('Please choose a valid appointment date.');
  if (violatesNoticeWindow(dateKey, startTime)) throw new Error(`Please choose a time at least ${APPOINTMENT_CONFIG.minNoticeHours} hours from now.`);
  if (!APPOINTMENT_CONFIG.workingDays.includes(dayOfWeek(dateKey))) throw new Error('Appointments are not available on this day.');
  const start = toMinutes(startTime);
  const end = start + Number(durationMinutes);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) throw new Error('Please choose a valid appointment time.');
  if (start < toMinutes(APPOINTMENT_CONFIG.workingHours.start) || end > toMinutes(APPOINTMENT_CONFIG.workingHours.end)) throw new Error('The selected time is outside appointment hours.');
  const breakStart = toMinutes(APPOINTMENT_CONFIG.break.start);
  const breakEnd = toMinutes(APPOINTMENT_CONFIG.break.end);
  if (start < breakEnd && end > breakStart) throw new Error('The selected time overlaps the appointment break.');
  return true;
}

export function isWithinBookingWindow(dateKey) {
  const today = todayKey();
  const maxDate = addDays(today, APPOINTMENT_CONFIG.advanceBookingDays);
  return dateKey >= today && dateKey <= maxDate;
}

export function configForClient() {
  return {
    timezone: APPOINTMENT_CONFIG.timezone,
    slotMinutes: APPOINTMENT_CONFIG.slotMinutes,
    advanceBookingDays: APPOINTMENT_CONFIG.advanceBookingDays,
    minNoticeHours: APPOINTMENT_CONFIG.minNoticeHours,
    workingDays: APPOINTMENT_CONFIG.workingDays,
    workingHours: APPOINTMENT_CONFIG.workingHours,
    break: APPOINTMENT_CONFIG.break,
    types: APPOINTMENT_CONFIG.types
  };
}
