/**
 * Shahnawaz Enterprises public profile.
 * Replace only the clearly empty fields with company-approved information.
 * Do not publish unverified contact details, certifications, project claims or prices.
 */
export const COMPANY_PROFILE = {
  name: 'Shahnawaz Enterprises',
  tagline: 'We Make Interiors',
  logoUrl: '',
  about: {
    eyebrow: 'About Us',
    heading: 'Crafting spaces with purpose.',
    summary: 'Shahnawaz Enterprises is presented around interior contracts, interior consultancy and general order supply.',
    description: 'We invite clients to share their project requirements so the appropriate interior services and supply options can be discussed. Specific company history and official mission and vision statements will be added after confirmation by the company.',
    history: '',
    mission: '',
    vision: ''
  },
  services: [
    {
      title: 'Contracts',
      description: 'Contract-related support for interior projects, based on the confirmed scope and requirements.'
    },
    {
      title: 'Interior Consultants',
      description: 'Interior consultancy to discuss project needs, possible approaches and relevant requirements.'
    },
    {
      title: 'General Order Suppliers',
      description: 'General order supply for requirements within the interior-work domain, subject to company confirmation.'
    }
  ],
  solutionCategories: [
    'Interior Finishing',
    'Architectural Elements',
    'Woodwork',
    'Furniture & Fixtures',
    'Doors & Joinery',
    'Decorative Elements'
  ],
  solutionCategoriesAreExamples: true,
  reasonsToChoose: [
    { title: 'Professional Approach', description: 'A clear starting point for discussing client requirements and project objectives.' },
    { title: 'Interior-Focused Services', description: 'The listed services focus on contracts, interior consultancy and general order supply.' },
    { title: 'Coordinated Support', description: 'Discuss the project scope and related supply needs with the company team.' },
    { title: 'Requirement-Led Planning', description: 'Project scope, materials and pricing should be confirmed before work is agreed.' }
  ],
  contact: {
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    businessHours: '',
    mapUrl: ''
  },
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
    pinterest: '',
    whatsapp: '',
    youtube: ''
  },
  contentStatus: 'company-details-pending'
};

export const hasValue = value => typeof value === 'string' && value.trim().length > 0;
