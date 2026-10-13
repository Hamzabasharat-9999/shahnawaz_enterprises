import { getRecommendations } from '../services/recommendationService.js';
import Product from '../models/Product.js';

export async function recommend(req,res,next){
  try {
    const input = req.body || {};
    const result = await getRecommendations(input);
    res.json(result);
  } catch(e){ next(e); }
}

export async function featuredRecommendations(req,res,next){
  try {
    const products = await Product.find({status:'active',featured:true}).sort({updatedAt:-1}).limit(6).lean();
    res.json({items:products,engine:'catalog-featured'});
  } catch(e){ next(e); }
}
