/**
 * Public company profile used by the backend assistant.
 * Keep aligned with client/src/config/companyProfile.js until a managed settings
 * service is introduced. Empty values intentionally mean "not yet confirmed".
 */
export const COMPANY_PROFILE = {
  name: 'Shahnawaz Enterprises',
  tagline: 'We Make Interiors',
  logoUrl: '',
  about: { summary: 'Shahnawaz Enterprises is presented around interior contracts, interior consultancy and general order supply.', history: '', mission: '', vision: '' },
  services: ['Contracts', 'Interior Consultants', 'General Order Suppliers'],
  contact: {
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    businessHours: '',
    mapUrl: ''
  },
  social: { instagram: '', facebook: '', linkedin: '', youtube: '' },
  mission: '',
  vision: '',
  contentStatus: 'company-details-pending'
};
