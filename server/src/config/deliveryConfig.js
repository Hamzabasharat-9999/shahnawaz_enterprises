export const DELIVERY_CONFIG = {
  currency: 'PKR',
  cities: ['Rawalpindi', 'Islamabad', 'Other'],
  timeWindows: [
    { key: '09:00-12:00', label: '09:00 AM – 12:00 PM' },
    { key: '12:00-15:00', label: '12:00 PM – 03:00 PM' },
    { key: '15:00-18:00', label: '03:00 PM – 06:00 PM' }
  ],
  statuses: [
    'pending', 'scheduled', 'assigned', 'out_for_delivery', 'delivered', 'failed', 'cancelled'
  ]
};

export const configForClient = () => DELIVERY_CONFIG;
