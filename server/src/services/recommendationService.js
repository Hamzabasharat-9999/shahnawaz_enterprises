import Product from '../models/Product.js';

const normalize = (v='') => String(v).toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
const tokens = (v='') => normalize(v).split(' ').filter(Boolean);
const clamp = (n,min,max) => Math.max(min, Math.min(max,n));

const projectCategoryMap = {
  kitchen: ['kitchen','cabinet','woodwork','furniture','storage'],
  bedroom: ['bedroom','wardrobe','furniture','woodwork','storage'],
  living: ['living','furniture','wall','decorative','woodwork'],
  office: ['office','furniture','partition','woodwork','architectural'],
  commercial: ['commercial','architectural','flooring','wall','furniture'],
  hospitality: ['hospitality','furniture','decorative','wall','flooring'],
  whole_space: ['interior','furniture','flooring','wall','architectural']
};

export async function getRecommendations(input={}) {
  const {
    projectType='', room='', budget=0, budgetFlexibility='medium',
    preferredMaterials=[], preferredFinishes=[], preferredStyles=[],
    needs=[], search='', limit=6
  } = input;
  const products = await Product.find({ status:'active' }).lean();
  const queryTokens = [...tokens(search), ...tokens(room), ...tokens(projectType), ...preferredStyles.flatMap(tokens), ...needs.flatMap(tokens), ...preferredMaterials.flatMap(tokens), ...preferredFinishes.flatMap(tokens)];
  const uniqueQuery = [...new Set(queryTokens)];
  const categories = projectCategoryMap[normalize(projectType).replace(/ /g,'_')] || [];
  const maxBudget = Number(budget) || 0;

  const scored = products.map(product => {
    const text = normalize([product.name, product.category, product.shortDescription, product.description, ...(product.tags||[]), ...Object.values(product.specifications||{})].join(' '));
    const productTokens = new Set(tokens(text));
    let score = 18;
    const reasons = [];
    let matched = 0;
    uniqueQuery.forEach(t => { if (productTokens.has(t) || text.includes(t)) matched++; });
    if (matched) { score += Math.min(28, matched * 6); reasons.push(`${matched} preference match${matched===1?'':'es'}`); }
    if (categories.some(c => text.includes(c) || normalize(product.category).includes(c))) { score += 18; reasons.push('fits the selected project type'); }
    if (preferredMaterials.some(m => text.includes(normalize(m)))) { score += 12; reasons.push('matches your material preference'); }
    if (preferredFinishes.some(f => text.includes(normalize(f)))) { score += 8; reasons.push('matches your finish preference'); }
    if (preferredStyles.some(s => text.includes(normalize(s)))) { score += 10; reasons.push('matches your style preference'); }
    if (needs.some(n => text.includes(normalize(n)))) { score += 10; reasons.push('supports a requested need'); }
    if (product.featured) { score += 5; reasons.push('featured in the catalog'); }
    if (search && text.includes(normalize(search))) { score += 8; reasons.push('matches your search'); }

    const price = product.priceMode === 'starting' ? Number(product.basePrice || 0) : 0;
    if (maxBudget && price) {
      const tolerance = budgetFlexibility === 'high' ? .35 : budgetFlexibility === 'low' ? .08 : .2;
      if (price <= maxBudget) { score += 12; reasons.push('within your stated budget'); }
      else if (price <= maxBudget * (1+tolerance)) { score += 5; reasons.push('close to your budget range'); }
      else { score -= 10; }
    }
    return { product, score: clamp(score,0,100), reasons:[...new Set(reasons)].slice(0,4) };
  }).sort((a,b)=>b.score-a.score || Number(b.product.featured)-Number(a.product.featured));

  const items = scored.slice(0, clamp(Number(limit)||6,1,12)).map((x,index)=>({
    rank:index+1, score:Math.round(x.score), reasons:x.reasons.length?x.reasons:['catalog match'], product:x.product
  }));
  const confidence = items.length ? Math.round(items.reduce((a,x)=>a+x.score,0)/items.length) : 0;
  return { items, confidence, engine:'Shahnawaz SmartMatch v1', disclaimer:'Recommendations are decision support based on catalog data and your stated preferences. Final suitability, dimensions, materials and pricing should be confirmed with the company.' };
}
