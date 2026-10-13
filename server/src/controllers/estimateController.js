import Product from '../models/Product.js';
import { ESTIMATE_CONFIG } from '../config/estimateConfig.js';
import { calculateEstimate, calculateProjectEstimate } from '../services/estimateService.js';

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('At least one estimate item is required.');
  return items;
}

export async function getEstimateConfig(req, res) {
  res.json({
    currency: ESTIMATE_CONFIG.currency,
    defaults: {
      wastePercent: ESTIMATE_CONFIG.wastePercent,
      laborPercent: ESTIMATE_CONFIG.laborPercent,
      overheadPercent: ESTIMATE_CONFIG.overheadPercent,
      contingencyPercent: ESTIMATE_CONFIG.contingencyPercent
    },
    materialRates: ESTIMATE_CONFIG.materialRates,
    finishRates: ESTIMATE_CONFIG.finishRates,
    note: 'These are planning defaults. Replace them with verified company rates before production use.'
  });
}

export async function calculateEstimateEndpoint(req, res) {
  try {
    const { productId, quantity, dimensions, material, finish, ...options } = req.body;
    let product = null;
    if (productId) {
      product = await Product.findOne({ _id: productId, status: 'active' });
      if (!product) return res.status(404).json({ message: 'Product not found or unavailable.' });
    }
    const estimate = calculateEstimate({ product, quantity, dimensions, material, finish, ...options });
    res.json({ estimate });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to calculate estimate.' });
  }
}

export async function calculateProjectEndpoint(req, res) {
  try {
    const rawItems = normalizeItems(req.body.items);
    const ids = rawItems.map((item) => item.productId).filter(Boolean);
    const products = ids.length ? await Product.find({ _id: { $in: ids }, status: 'active' }) : [];
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const hydrated = rawItems.map((item) => ({
      product: item.productId ? productMap.get(String(item.productId)) : null,
      quantity: item.quantity,
      dimensions: item.dimensions,
      material: item.material,
      finish: item.finish
    }));

    const result = calculateProjectEstimate(hydrated, req.body.options || {});
    res.json({ estimate: result });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to calculate project estimate.' });
  }
}
