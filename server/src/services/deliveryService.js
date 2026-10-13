export const deliveryTransitions = {
  pending: ['scheduled', 'cancelled'],
  scheduled: ['assigned', 'pending', 'cancelled'],
  assigned: ['out_for_delivery', 'scheduled', 'cancelled'],
  out_for_delivery: ['delivered', 'failed'],
  delivered: [],
  failed: ['scheduled', 'cancelled'],
  cancelled: []
};

export function normaliseAddress(body = {}) {
  const value = key => String(body[key] ?? '').trim();
  const latitude = body.latitude === '' || body.latitude == null ? null : Number(body.latitude);
  const longitude = body.longitude === '' || body.longitude == null ? null : Number(body.longitude);
  if (latitude !== null && !Number.isFinite(latitude)) throw new Error('Latitude must be a valid number.');
  if (longitude !== null && !Number.isFinite(longitude)) throw new Error('Longitude must be a valid number.');
  return {
    recipientName: value('recipientName'), recipientPhone: value('recipientPhone'),
    addressLine1: value('addressLine1'), addressLine2: value('addressLine2'),
    area: value('area'), city: value('city'), postalCode: value('postalCode'),
    landmark: value('landmark'), latitude, longitude,
    customerInstructions: value('customerInstructions')
  };
}

export function mapsUrl(delivery) {
  if (delivery.latitude != null && delivery.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${delivery.latitude},${delivery.longitude}`)}`;
  }
  const address = [delivery.addressLine1, delivery.addressLine2, delivery.area, delivery.city, delivery.postalCode].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
