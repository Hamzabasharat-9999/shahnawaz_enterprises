import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { connectDB } from '../config/db.js';

// These four entries are demonstration records, not verified company products.
// Existing products are left untouched; this script only inserts missing draft examples and never deletes data.
const products = [
  { name:'Custom Interior Woodwork', slug:'custom-interior-woodwork', category:'Woodwork', shortDescription:'Demonstration entry for custom interior woodwork; confirm the real offering with the company.', description:'DRAFT DEMONSTRATION CONTENT. Replace with company-approved product details, materials, finish options, dimensions, images and pricing policy before publishing.', priceMode:'quote', unit:'project', featured:false, tags:['sample','draft','woodwork'], images:[], specifications:{Material:'To be confirmed',Finish:'To be confirmed',LeadTime:'To be confirmed'}, status:'draft' },
  { name:'Interior Doors & Joinery', slug:'interior-doors-joinery', category:'Doors & Joinery', shortDescription:'Demonstration entry for doors and joinery; confirm the real offering with the company.', description:'DRAFT DEMONSTRATION CONTENT. Replace with company-approved product details, materials, finish options, dimensions, images and pricing policy before publishing.', priceMode:'quote', unit:'set', featured:false, tags:['sample','draft','doors','joinery'], images:[], specifications:{Material:'To be confirmed',Style:'To be confirmed',Finish:'To be confirmed'}, status:'draft' },
  { name:'Decorative Wall Solution', slug:'decorative-wall-solution', category:'Wall Solutions', shortDescription:'Demonstration entry for wall solutions; confirm the real offering with the company.', description:'DRAFT DEMONSTRATION CONTENT. Replace with company-approved product details, materials, finish options, dimensions, images and pricing policy before publishing.', priceMode:'quote', unit:'project', featured:false, tags:['sample','draft','walls'], images:[], specifications:{Application:'To be confirmed',Finish:'To be confirmed',Measurement:'To be confirmed'}, status:'draft' },
  { name:'Furniture & Fixtures', slug:'furniture-fixtures', category:'Furniture & Fixtures', shortDescription:'Demonstration entry for furniture and fixtures; confirm the real offering with the company.', description:'DRAFT DEMONSTRATION CONTENT. Replace with company-approved product details, materials, finish options, dimensions, images and pricing policy before publishing.', priceMode:'quote', unit:'item', featured:false, tags:['sample','draft','furniture','fixtures'], images:[], specifications:{Material:'To be confirmed',Customization:'To be confirmed',Finish:'To be confirmed'}, status:'draft' }
];

await connectDB();
let inserted = 0;
let skipped = 0;
for (const product of products) {
  const existing = await Product.findOne({ slug: product.slug }).select('_id').lean();
  if (existing) {
    skipped += 1;
    continue;
  }
  await Product.create(product);
  inserted += 1;
}
console.log(`Seed complete: inserted ${inserted} missing draft examples; left ${skipped} existing products untouched.`);
await mongoose.disconnect();
