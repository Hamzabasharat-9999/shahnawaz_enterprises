import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index = 0 }) {
  const image = product.images?.[0]?.url || '/image-placeholder.svg';
  return (
    <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .45, delay: index * .05 }} className="group">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e1d3]">
          <img src={image} alt={product.images?.[0]?.alt || product.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-placeholder.svg'; }} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
          {product.featured && <span className="absolute left-4 top-4 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em]">Featured</span>}
          <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white transition group-hover:-translate-y-1"><ArrowUpRight size={17}/></span>
        </div>
        <div className="flex items-start justify-between gap-5 pt-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#b18a55]">{product.category}</p><h3 className="mt-2 font-serif text-2xl leading-tight">{product.name}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-black/55">{product.shortDescription}</p></div>
          <span className="whitespace-nowrap pt-1 text-[11px] font-semibold uppercase tracking-wider text-black/45">{product.priceMode === 'starting' ? `From ${product.basePrice}` : 'Quote'}</span>
        </div>
      </Link>
    </motion.article>
  );
}
