import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import InventoryItem from '../models/InventoryItem.js';

const orderStatuses = ['pending_confirmation','confirmed','in_production','quality_check','ready_for_delivery','out_for_delivery','delivered','completed','cancelled'];

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const monthLabel = (date) => date.toLocaleString('en-US', { month: 'short' });

export async function getAdminDashboard(req, res) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    orderCounts,
    quotationCounts,
    productCounts,
    customerCount,
    revenueAgg,
    recentOrders,
    recentQuotations,
    monthlyRevenue,
    monthlyOrders,
    pipelineAgg,
    inventoryCounts
  ] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Quotation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments({ role: 'customer' }),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: '$currency', total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    Quotation.find().sort({ createdAt: -1 }).limit(8).lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $nin: ['cancelled'] } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    Order.aggregate([{ $match: { status: { $nin: ['cancelled','completed'] } } }, { $group: { _id: '$status', value: { $sum: '$total' }, count: { $sum: 1 } } }]),
    InventoryItem.aggregate([{ $match: { active: true } }, { $group: { _id: null, items: { $sum: 1 }, lowStock: { $sum: { $cond: [{ $lte: ['$onHand', '$reorderLevel'] }, 1, 0] } }, value: { $sum: { $multiply: ['$onHand', '$costPerUnit'] } } } }])
  ]);

  const countMap = (rows) => Object.fromEntries(rows.map(r => [r._id, r.count]));
  const ordersByStatus = countMap(orderCounts);
  const quotationsByStatus = countMap(quotationCounts);
  const productsByStatus = countMap(productCounts);
  const revenueByCurrency = Object.fromEntries(revenueAgg.map(r => [r._id || 'PKR', { total: r.total, count: r.count }]));

  const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
  const revenueMap = Object.fromEntries(monthlyRevenue.map(r => [`${r._id.year}-${r._id.month}`, r.total]));
  const orderMap = Object.fromEntries(monthlyOrders.map(r => [`${r._id.year}-${r._id.month}`, r.count]));
  const trend = months.map(m => ({
    key: `${m.getFullYear()}-${m.getMonth() + 1}`,
    month: monthLabel(m),
    revenue: revenueMap[`${m.getFullYear()}-${m.getMonth() + 1}`] || 0,
    orders: orderMap[`${m.getFullYear()}-${m.getMonth() + 1}`] || 0
  }));

  const pipeline = orderStatuses.filter(s => !['cancelled','completed'].includes(s)).map(status => {
    const row = pipelineAgg.find(r => r._id === status);
    return { status, count: ordersByStatus[status] || 0, value: row?.value || 0 };
  });

  const cleanOrder = (o) => ({ id: o._id, orderNumber: o.orderNumber, projectTitle: o.projectTitle, customerName: o.customerSnapshot?.name || 'Customer', total: o.total, currency: o.currency || 'PKR', status: o.status, createdAt: o.createdAt });
  const cleanQuotation = (q) => ({ id: q._id, quotationNumber: q.quotationNumber, projectTitle: q.projectTitle, customerName: q.customerSnapshot?.name || 'Customer', estimatedSubtotal: q.estimatedSubtotal, quotedTotal: q.quotedTotal, currency: q.currency || 'PKR', status: q.status, createdAt: q.createdAt });

  res.json({
    generatedAt: now.toISOString(),
    kpis: {
      totalOrders: orderCounts.reduce((a, r) => a + r.count, 0),
      activeOrders: orderStatuses.filter(s => !['completed','cancelled'].includes(s)).reduce((a, s) => a + (ordersByStatus[s] || 0), 0),
      completedOrders: ordersByStatus.completed || 0,
      totalQuotations: quotationCounts.reduce((a, r) => a + r.count, 0),
      pendingQuotations: ['submitted','under_review','needs_information'].reduce((a, s) => a + (quotationsByStatus[s] || 0), 0),
      customers: customerCount,
      activeProducts: productsByStatus.active || 0,
      totalProducts: productCounts.reduce((a, r) => a + r.count, 0),
      inventoryItems: inventoryCounts[0]?.items || 0,
      lowStockInventory: inventoryCounts[0]?.lowStock || 0,
      inventoryValue: inventoryCounts[0]?.value || 0
    },
    revenueByCurrency,
    ordersByStatus,
    quotationsByStatus,
    productsByStatus,
    pipeline,
    trend,
    recentOrders: recentOrders.map(cleanOrder),
    recentQuotations: recentQuotations.map(cleanQuotation)
  });
}
