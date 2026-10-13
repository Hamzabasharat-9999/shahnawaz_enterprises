export const APPOINTMENT_CONFIG = {
  timezone: 'Asia/Karachi',
  currency: 'PKR',
  slotMinutes: 30,
  advanceBookingDays: 45,
  minNoticeHours: 2,
  workingDays: [1, 2, 3, 4, 5, 6],
  workingHours: { start: '10:00', end: '17:00' },
  break: { start: '13:00', end: '14:00' },
  types: [
    { key: 'initial_consultation', label: 'Initial Consultation', durationMinutes: 30, description: 'Discuss your project scope, goals and next steps.' },
    { key: 'site_measurement', label: 'Site Measurement', durationMinutes: 60, description: 'Arrange a site visit for measurements and project assessment.' },
    { key: 'design_consultation', label: 'Design Consultation', durationMinutes: 60, description: 'Review design direction, finishes and spatial requirements.' },
    { key: 'material_consultation', label: 'Material Consultation', durationMinutes: 30, description: 'Discuss materials, finishes and product options.' },
    { key: 'project_review', label: 'Project Review', durationMinutes: 30, description: 'Review an existing quotation, order or project.' }
  ]
};

export function getAppointmentType(key) {
  return APPOINTMENT_CONFIG.types.find(type => type.key === key);
}
export function configForClient() {
  return APPOINTMENT_CONFIG;
}
