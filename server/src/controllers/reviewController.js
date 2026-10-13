import Review from '../models/Review.js';
import Order from '../models/Order.js';

const eligibleStatuses = ['delivered', 'completed'];
const publicProjection = 'orderNumber projectTitle rating title body categories recommend createdAt customer';

function cleanString(value, max = 1800) {
  return String(value ?? '').trim().slice(0, max);
}

function normalizeRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

function normalizeCategories(categories = {}) {
  const keys = ['quality', 'service', 'communication', 'value'];
  return Object.fromEntries(keys.map((key) => {
    const value = categories?.[key] == null || categories?.[key] === '' ? null : normalizeRating(categories[key]);
    return [key, value];
  }));
}

export async function listPublicReviews(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const rating = req.query.rating ? Number(req.query.rating) : null;
    const filter = { status: 'approved' };
    if (rating >= 1 && rating <= 5) filter.rating = rating;

    const [reviews, total, aggregate] = await Promise.all([
      Review.find(filter)
        .select(publicProjection)
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: { average: Number((aggregate[0]?.average || 0).toFixed(1)), count: aggregate[0]?.count || 0 }
    });
  } catch (error) { next(error); }
}

export async function getReviewConfig(req, res) {
  res.json({
    eligibleStatuses,
    minimumBodyLength: 20,
    maximumBodyLength: 1800,
    ratingScale: 5
  });
}

export async function listMyReviews(req, res, next) {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('order', 'orderNumber projectTitle status total currency')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reviews });
  } catch (error) { next(error); }
}

export async function createReview(req, res, next) {
  try {
    const { orderId, rating, title, body, categories, recommend } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Order is required.' });

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (!eligibleStatuses.includes(order.status)) {
      return res.status(400).json({ message: 'A review can be submitted after the order is delivered or completed.' });
    }

    const existing = await Review.findOne({ order: order._id });
    if (existing) return res.status(409).json({ message: 'This order already has a review.' });

    const normalizedRating = normalizeRating(rating);
    const cleanTitle = cleanString(title, 120);
    const cleanBody = cleanString(body, 1800);
    if (!normalizedRating) return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    if (cleanTitle.length < 3) return res.status(400).json({ message: 'Please add a short review title.' });
    if (cleanBody.length < 20) return res.status(400).json({ message: 'Review details must be at least 20 characters.' });

    const review = await Review.create({
      customer: req.user._id,
      order: order._id,
      orderNumber: order.orderNumber,
      projectTitle: order.projectTitle,
      rating: normalizedRating,
      title: cleanTitle,
      body: cleanBody,
      categories: normalizeCategories(categories),
      recommend: recommend !== false,
      status: 'pending'
    });

    res.status(201).json({ review, message: 'Thank you. Your review has been submitted for moderation.' });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'This order already has a review.' });
    next(error);
  }
}

export async function updateMyReview(req, res, next) {
  try {
    const review = await Review.findOne({ _id: req.params.id, customer: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (review.status !== 'pending') return res.status(400).json({ message: 'Only pending reviews can be edited.' });

    const rating = normalizeRating(req.body.rating);
    const title = cleanString(req.body.title, 120);
    const body = cleanString(req.body.body, 1800);
    if (!rating || title.length < 3 || body.length < 20) return res.status(400).json({ message: 'Please provide a valid rating, title and review of at least 20 characters.' });

    review.rating = rating;
    review.title = title;
    review.body = body;
    review.categories = normalizeCategories(req.body.categories);
    review.recommend = req.body.recommend !== false;
    await review.save();
    res.json({ review, message: 'Review updated.' });
  } catch (error) { next(error); }
}

export async function adminListReviews(req, res, next) {
  try {
    const { status, rating, search } = req.query;
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(status)) filter.status = status;
    if (rating && Number(rating) >= 1 && Number(rating) <= 5) filter.rating = Number(rating);
    if (search?.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ orderNumber: regex }, { projectTitle: regex }, { title: regex }, { body: regex }];
    }

    const reviews = await Review.find(filter)
      .populate('customer', 'name email phone')
      .populate('order', 'orderNumber projectTitle status total currency')
      .sort({ createdAt: -1 })
      .limit(250)
      .lean();

    const [pending, approved, rejected, averageAgg] = await Promise.all([
      Review.countDocuments({ status: 'pending' }),
      Review.countDocuments({ status: 'approved' }),
      Review.countDocuments({ status: 'rejected' }),
      Review.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, average: { $avg: '$rating' } } }])
    ]);

    res.json({ reviews, stats: { pending, approved, rejected, average: Number((averageAgg[0]?.average || 0).toFixed(1)) } });
  } catch (error) { next(error); }
}

export async function adminGetReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('order', 'orderNumber projectTitle status total currency items createdAt')
      .lean();
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ review });
  } catch (error) { next(error); }
}

export async function adminModerateReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    const { status, adminNote } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid review status.' });
    review.status = status;
    review.adminNote = cleanString(adminNote, 1200);
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    await review.save();
    res.json({ review, message: `Review ${status}.` });
  } catch (error) { next(error); }
}

export async function adminDeleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (error) { next(error); }
}
