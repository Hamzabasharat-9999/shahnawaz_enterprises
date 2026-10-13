import Product from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

const cleanProduct = (product) => ({
  id: product._id,
  name: product.name,
  slug: product.slug,
  category: product.category,
  shortDescription: product.shortDescription,
  description: product.description,
  priceMode: product.priceMode,
  basePrice: product.basePrice,
  unit: product.unit,
  images: product.images,
  specifications: Object.fromEntries(product.specifications || []),
  tags: product.tags,
  featured: product.featured,
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

export async function listProducts(req, res) {
  const { search = '', category = '', featured = '', status = 'active', page = 1, limit = 12 } = req.query;
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 48);
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (search.trim()) filter.$text = { $search: search.trim() };

  const [items, total, categories] = await Promise.all([
    Product.find(filter).sort({ featured: -1, createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize),
    Product.countDocuments(filter),
    Product.distinct('category', { status: 'active' })
  ]);

  res.json({ items: items.map(cleanProduct), pagination: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) }, categories: categories.sort() });
}

export async function getProduct(req, res) {
  const value = req.params.slug;
  const product = /^[0-9a-fA-F]{24}$/.test(value)
    ? await Product.findById(value)
    : await Product.findOne({ slug: value });
  if (!product || product.status !== 'active') return res.status(404).json({ message: 'Product not found.' });
  res.json({ product: cleanProduct(product) });
}

export async function adminListProducts(req, res) {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json({ items: items.map(cleanProduct) });
}

function buildPayload(body) {
  const payload = { ...body };
  payload.name = String(body.name || '').trim();
  payload.slug = slugify(body.slug || body.name);
  payload.category = String(body.category || '').trim();
  payload.shortDescription = String(body.shortDescription || '').trim();
  payload.description = String(body.description || '').trim();
  payload.images = Array.isArray(body.images) ? body.images.filter((x) => x?.url).map((x) => ({ url: String(x.url).trim(), alt: String(x.alt || '').trim(), publicId: String(x.publicId || '').trim(), width: Number(x.width) || null, height: Number(x.height) || null, format: String(x.format || '').trim() })) : [];
  payload.tags = Array.isArray(body.tags) ? body.tags.map(String).map((x) => x.trim()).filter(Boolean) : [];
  payload.basePrice = Number(body.basePrice || 0);
  return payload;
}

export async function createProduct(req, res) {
  const payload = buildPayload(req.body);
  if (!payload.name || !payload.category || !payload.shortDescription || !payload.description) return res.status(400).json({ message: 'Name, category, short description and description are required.' });
  const product = await Product.create(payload);
  res.status(201).json({ message: 'Product created.', product: cleanProduct(product) });
}

export async function updateProduct(req, res) {
  const payload = buildPayload(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product updated.', product: cleanProduct(product) });
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product archived.' });
}
