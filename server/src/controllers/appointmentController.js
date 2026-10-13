import { notifyCustomer, notifyAdmin } from '../services/emailService.js';
import Appointment from '../models/Appointment.js';
import { configForClient, getAppointmentType } from '../config/appointmentConfig.js';
import { addDays, buildSlots, isWithinBookingWindow, slotKeysFor, todayKey, validateDateAndTime } from '../services/appointmentService.js';
import { makeAppointmentNumber } from '../utils/appointmentNumber.js';

const clean = a => ({
  id: a._id,
  appointmentNumber: a.appointmentNumber,
  customer: a.customer,
  customerSnapshot: a.customerSnapshot,
  type: a.type,
  typeLabel: a.typeLabel,
  durationMinutes: a.durationMinutes,
  dateKey: a.dateKey,
  startTime: a.startTime,
  endTime: a.endTime,
  preferredMode: a.preferredMode,
  projectTitle: a.projectTitle,
  projectType: a.projectType,
  siteAddress: a.siteAddress,
  notes: a.notes,
  status: a.status,
  adminNotes: a.adminNotes,
  cancellationReason: a.cancellationReason,
  confirmedAt: a.confirmedAt,
  completedAt: a.completedAt,
  cancelledAt: a.cancelledAt,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt
});

export function getAppointmentConfig(req, res) { res.json(configForClient()); }

export async function getAvailability(req, res) {
  try {
    const { date = '', type = 'initial_consultation' } = req.query;
    const appointmentType = getAppointmentType(type);
    if (!appointmentType) return res.status(400).json({ message: 'Invalid appointment type.' });
    if (!isWithinBookingWindow(date)) return res.status(400).json({ message: 'Choose a date within the available booking window.' });
    const appointments = await Appointment.find({ dateKey: date, status: { $in: ['pending', 'confirmed'] } }).select('slotKeys');
    const booked = new Set(appointments.flatMap(item => item.slotKeys || []));
    res.json({ date, type, slots: buildSlots(date, type, booked) });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to load availability.' }); }
}

export async function createAppointment(req, res) {
  try {
    const { type, dateKey, startTime, preferredMode = 'in_person', projectTitle = '', projectType = '', siteAddress = '', notes = '' } = req.body;
    const appointmentType = getAppointmentType(type);
    if (!appointmentType) return res.status(400).json({ message: 'Please choose a valid appointment type.' });
    if (!isWithinBookingWindow(dateKey)) return res.status(400).json({ message: 'Choose a date within the available booking window.' });
    validateDateAndTime({ dateKey, startTime, durationMinutes: appointmentType.durationMinutes });
    const slotKeys = slotKeysFor(dateKey, startTime, appointmentType.durationMinutes);
    const conflict = await Appointment.findOne({ slotKeys: { $in: slotKeys }, status: { $in: ['pending', 'confirmed'] } });
    if (conflict) return res.status(409).json({ message: 'That appointment time was just booked. Please choose another slot.' });
    const endTime = buildSlots(dateKey, type).find(s => s.startTime === startTime)?.endTime;
    const appointment = await Appointment.create({
      appointmentNumber: makeAppointmentNumber(), customer: req.user._id,
      customerSnapshot: { name: req.user.name, email: req.user.email, phone: req.user.phone || '' },
      type, typeLabel: appointmentType.label, durationMinutes: appointmentType.durationMinutes,
      dateKey, startTime, endTime, slotKeys, preferredMode, projectTitle: String(projectTitle).trim(), projectType: String(projectType).trim(),
      siteAddress: String(siteAddress).trim(), notes: String(notes).trim(), status: 'pending'
    });
    void notifyCustomer({ to: req.user.email, name: req.user.name, subject: `Appointment request ${appointment.appointmentNumber}`, heading: 'your appointment request was received', message: 'Our team has received your appointment request and will review it. This message is a receipt, not a final confirmation.', details: [{label:'Reference',value:appointment.appointmentNumber},{label:'Type',value:appointment.typeLabel},{label:'Date',value:appointment.dateKey},{label:'Time',value:appointment.startTime},{label:'Status',value:appointment.status}] });
    void notifyAdmin({ subject: `New appointment request ${appointment.appointmentNumber}`, heading: 'New appointment request', message: 'A customer submitted an appointment request.', details: [{label:'Reference',value:appointment.appointmentNumber},{label:'Customer',value:req.user.name},{label:'Email',value:req.user.email},{label:'Date',value:appointment.dateKey},{label:'Time',value:appointment.startTime}] });
    res.status(201).json({ message: 'Appointment request submitted.', appointment: clean(appointment) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'That appointment time is no longer available. Please choose another slot.' });
    res.status(400).json({ message: error.message || 'Unable to create appointment.' });
  }
}

export async function listMyAppointments(req, res) {
  const items = await Appointment.find({ customer: req.user._id }).sort({ dateKey: 1, startTime: 1, createdAt: -1 });
  res.json({ items: items.map(clean) });
}

export async function getMyAppointment(req, res) {
  const appointment = await Appointment.findOne({ _id: req.params.id, customer: req.user._id });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  res.json({ appointment: clean(appointment) });
}

export async function cancelMyAppointment(req, res) {
  const appointment = await Appointment.findOne({ _id: req.params.id, customer: req.user._id });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  if (!['pending', 'confirmed'].includes(appointment.status)) return res.status(409).json({ message: 'This appointment can no longer be cancelled.' });
  appointment.status = 'cancelled'; appointment.cancelledAt = new Date(); appointment.cancellationReason = String(req.body.reason || 'Cancelled by customer').trim();
  await appointment.save();
  res.json({ message: 'Appointment cancelled.', appointment: clean(appointment) });
}

export async function adminListAppointments(req, res) {
  const { status = '', date = '', search = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) filter.dateKey = date;
  const value = String(search || '').trim();
  if (value) filter.$or = [
    { appointmentNumber: { $regex: value, $options: 'i' } }, { 'customerSnapshot.name': { $regex: value, $options: 'i' } },
    { 'customerSnapshot.email': { $regex: value, $options: 'i' } }, { projectTitle: { $regex: value, $options: 'i' } }
  ];
  const items = await Appointment.find(filter).sort({ dateKey: 1, startTime: 1, createdAt: -1 });
  res.json({ items: items.map(clean) });
}

export async function adminGetAppointment(req, res) {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  res.json({ appointment: clean(appointment) });
}

export async function adminUpdateAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    const previousStatus = appointment.status;
    const nextStatus = req.body.status;
    if (nextStatus && !['pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rejected'].includes(nextStatus)) return res.status(400).json({ message: 'Invalid appointment status.' });

    const nextType = req.body.type || appointment.type;
    const type = getAppointmentType(nextType);
    if (!type) return res.status(400).json({ message: 'Invalid appointment type.' });
    const nextDate = req.body.dateKey || appointment.dateKey;
    const nextStart = req.body.startTime || appointment.startTime;
    const rescheduling = nextDate !== appointment.dateKey || nextStart !== appointment.startTime || nextType !== appointment.type;
    if (rescheduling) {
      if (!isWithinBookingWindow(nextDate)) return res.status(400).json({ message: 'Choose a date within the available booking window.' });
      validateDateAndTime({ dateKey: nextDate, startTime: nextStart, durationMinutes: type.durationMinutes });
      const slotKeys = slotKeysFor(nextDate, nextStart, type.durationMinutes);
      const conflict = await Appointment.findOne({ _id: { $ne: appointment._id }, slotKeys: { $in: slotKeys }, status: { $in: ['pending', 'confirmed'] } });
      if (conflict) return res.status(409).json({ message: 'The requested new time is already booked.' });
      const endTime = buildSlots(nextDate, nextType).find(s => s.startTime === nextStart)?.endTime;
      appointment.type = nextType; appointment.typeLabel = type.label; appointment.durationMinutes = type.durationMinutes;
      appointment.dateKey = nextDate; appointment.startTime = nextStart; appointment.endTime = endTime; appointment.slotKeys = slotKeys;
    }
    if (nextStatus && nextStatus !== appointment.status) {
      appointment.status = nextStatus;
      if (nextStatus === 'confirmed') appointment.confirmedAt = new Date();
      if (nextStatus === 'completed') appointment.completedAt = new Date();
      if (nextStatus === 'cancelled') appointment.cancelledAt = new Date();
    }
    if (req.body.preferredMode !== undefined) appointment.preferredMode = req.body.preferredMode;
    if (req.body.adminNotes !== undefined) appointment.adminNotes = String(req.body.adminNotes).trim();
    if (req.body.cancellationReason !== undefined) appointment.cancellationReason = String(req.body.cancellationReason).trim();
    await appointment.save();
    if (previousStatus !== appointment.status) void notifyCustomer({ to: appointment.customerSnapshot?.email, name: appointment.customerSnapshot?.name, subject: `Appointment ${appointment.appointmentNumber} update`, heading: 'your appointment status was updated', message: 'The team has updated your appointment. Please see the latest details below.', details: [{label:'Reference',value:appointment.appointmentNumber},{label:'Status',value:appointment.status},{label:'Date',value:appointment.dateKey},{label:'Time',value:appointment.startTime},{label:'Team note',value:appointment.adminNotes}] });
    res.json({ message: 'Appointment updated.', appointment: clean(appointment) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'That appointment time is already booked.' });
    res.status(400).json({ message: error.message || 'Unable to update appointment.' });
  }
}

export { addDays, todayKey };
