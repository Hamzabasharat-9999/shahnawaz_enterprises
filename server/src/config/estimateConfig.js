export const ESTIMATE_CONFIG = {
  currency: 'PKR',
  wastePercent: 8,
  laborPercent: 20,
  overheadPercent: 10,
  contingencyPercent: 5,
  minimumCharge: 0,
  defaultMaterialRate: 2500,
  defaultFinishRate: 650,
  materialRates: {
    'MDF': 2800,
    'Melamine MDF': 3200,
    'Plywood': 4200,
    'Solid Wood': 8500,
    'Laminate': 3000,
    'Veneer': 4800,
    'Glass': 3600,
    'Aluminium': 5200
  },
  finishRates: {
    'Matte': 550,
    'Gloss': 700,
    'Laminate': 650,
    'PU': 1200,
    'Veneer': 900,
    'Natural': 800
  }
};
