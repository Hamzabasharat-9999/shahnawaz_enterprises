import { COMPANY_PROFILE } from '../config/companyProfile.js';

export function getCompanyProfile(req, res) {
  const fields = [
    COMPANY_PROFILE.contact.address,
    COMPANY_PROFILE.contact.phone,
    COMPANY_PROFILE.contact.whatsapp,
    COMPANY_PROFILE.contact.email,
    COMPANY_PROFILE.contact.businessHours,
    COMPANY_PROFILE.mission,
    COMPANY_PROFILE.vision
  ];
  const profileComplete = fields.every(value => typeof value === 'string' && value.trim().length > 0);
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    company: COMPANY_PROFILE,
    meta: {
      profileComplete,
      contentStatus: COMPANY_PROFILE.contentStatus,
      note: profileComplete ? 'Profile fields are populated; verify their accuracy with the company.' : 'Some official company details have not yet been supplied.'
    }
  });
}
