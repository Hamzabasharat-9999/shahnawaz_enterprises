import { ESTIMATE_CONFIG } from '../config/estimateConfig.js';

const round = (value) => Number(Number(value || 0).toFixed(2));
const positive = (value) => Math.max(0, Number(value) || 0);

function areaFromDimensions(dimensions = {}) {
  const length = positive(dimensions.length);
  const width = positive(dimensions.width);
  const height = positive(dimensions.height);
  const provided = [length, width, height].filter(Boolean).length;

  if (provided >= 2) {
    return length * width;
  }

  return 1;
}

function volumeFromDimensions(dimensions = {}) {
  const length = positive(dimensions.length);
  const width = positive(dimensions.width);
  const height = positive(dimensions.height);
  if (length && width && height) return length * width * height;
  return 0;
}

function lookupRate(table, value, fallback) {
  if (!value) return fallback;
  const key = String(value).trim().toLowerCase();
  const match = Object.entries(table).find(([name]) => name.toLowerCase() === key);
  return match ? Number(match[1]) : fallback;
}

export function calculateEstimate({ product, quantity = 1, dimensions = {}, material = '', finish = '', customMaterialRate, customFinishRate, laborPercent, wastePercent, overheadPercent, contingencyPercent }) {
  const qty = Math.max(1, Number(quantity) || 1);
  const area = areaFromDimensions(dimensions);
  const volume = volumeFromDimensions(dimensions);

  const productBase = product?.priceMode === 'starting' ? positive(product.basePrice) : 0;
  const materialRate = customMaterialRate !== undefined
    ? positive(customMaterialRate)
    : lookupRate(ESTIMATE_CONFIG.materialRates, material, ESTIMATE_CONFIG.defaultMaterialRate);
  const finishRate = customFinishRate !== undefined
    ? positive(customFinishRate)
    : lookupRate(ESTIMATE_CONFIG.finishRates, finish, ESTIMATE_CONFIG.defaultFinishRate);

  const basis = productBase > 0 ? productBase : materialRate * area;
  const materialCost = round(basis * qty);
  const finishCost = round(finishRate * area * qty);
  const waste = round((materialCost + finishCost) * (positive(wastePercent ?? ESTIMATE_CONFIG.wastePercent) / 100));
  const directCost = round(materialCost + finishCost + waste);
  const labor = round(directCost * (positive(laborPercent ?? ESTIMATE_CONFIG.laborPercent) / 100));
  const overhead = round((directCost + labor) * (positive(overheadPercent ?? ESTIMATE_CONFIG.overheadPercent) / 100));
  const subtotal = round(directCost + labor + overhead);
  const contingency = round(subtotal * (positive(contingencyPercent ?? ESTIMATE_CONFIG.contingencyPercent) / 100));
  const total = round(Math.max(ESTIMATE_CONFIG.minimumCharge, subtotal + contingency));

  return {
    productId: product?._id || null,
    productName: product?.name || 'Custom project item',
    category: product?.category || '',
    pricingBasis: productBase > 0 ? 'product-starting-price' : 'area-material-rate',
    quantity: qty,
    dimensions: {
      length: positive(dimensions.length),
      width: positive(dimensions.width),
      height: positive(dimensions.height),
      unit: dimensions.unit || 'ft'
    },
    area: round(area),
    volume: round(volume),
    material: material || '',
    finish: finish || '',
    rates: {
      materialRate: round(materialRate),
      finishRate: round(finishRate),
      laborPercent: positive(laborPercent ?? ESTIMATE_CONFIG.laborPercent),
      wastePercent: positive(wastePercent ?? ESTIMATE_CONFIG.wastePercent),
      overheadPercent: positive(overheadPercent ?? ESTIMATE_CONFIG.overheadPercent),
      contingencyPercent: positive(contingencyPercent ?? ESTIMATE_CONFIG.contingencyPercent)
    },
    breakdown: {
      materialCost,
      finishCost,
      waste,
      directCost,
      labor,
      overhead,
      subtotal,
      contingency,
      total
    },
    currency: ESTIMATE_CONFIG.currency,
    isPreliminary: true
  };
}

export function calculateProjectEstimate(items = [], options = {}) {
  const lineItems = items.map((item) => calculateEstimate({ ...item, ...options }));
  const total = round(lineItems.reduce((sum, item) => sum + item.breakdown.total, 0));
  return {
    currency: ESTIMATE_CONFIG.currency,
    lineItems,
    totals: {
      total,
      count: lineItems.length
    },
    isPreliminary: true
  };
}
