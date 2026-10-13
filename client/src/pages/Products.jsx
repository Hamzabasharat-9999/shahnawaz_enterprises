import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/products/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]); const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(''); const [category, setCategory] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => { const t = setTimeout(() => setDebounced(search), 350); return () => clearTimeout(t); }, [search]);
  useEffect(() => { setLoading(true); setError(''); api.get(`/products?limit=48&${new URLSearchParams({ search: debounced, category })}`).then(d => { setProducts(d.items); setCategories(d.categories); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [debounced, category]);
  const hasFilters = Boolean(search || category);
  const title = useMemo(() => category || 'Interior Solutions', [category]);
  return <section className="min-h-screen bg-[#f5f2eb] px-6 pb-28 pt-40"><div className="container-main">
    <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end"><div><span className="eyebrow"> Product Catalog</span><h1 className="section-title mt-7">Explore our<br/><i className="text-black/40">{title}.</i></h1><p className="section-copy mt-7">Browse published products from the company catalog. Product details, specifications and pricing should be confirmed before an order is agreed.</p></div>
    <div className="space-y-3"><div className="relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="h-14 w-full border border-black/10 bg-white pl-11 pr-4 outline-none transition focus:border-black/30"/></div><div className="flex items-center gap-2"><SlidersHorizontal size={15}/><select value={category} onChange={e=>setCategory(e.target.value)} className="h-12 flex-1 border border-black/10 bg-white px-4 text-sm outline-none"><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select>{hasFilters&&<button onClick={()=>{setSearch('');setCategory('')}} className="flex h-12 w-12 items-center justify-center border border-black/10 bg-white"><X size={16}/></button>}</div></div></div>
    <div className="mt-20 border-t border-black/10 pt-8"><div className="mb-10 flex items-center justify-between"><p className="text-sm text-black/50">{loading?'Loading catalog…':`${products.length} product${products.length===1?'':'s'}`}</p><p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/35">Request a quotation for project pricing</p></div>
    {error ? <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}<p className="mt-2 text-red-700/70">Make sure the Phase 3 backend is running on port 5000.</p></div> : loading ? <div className="grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(x=><div key={x} className="aspect-[4/3] animate-pulse bg-black/5"/>)}</div> : products.length ? <div className="grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{products.map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div> : <div className="border border-black/10 bg-white p-12 text-center"><h2 className="font-serif text-3xl">{hasFilters ? 'No matching products' : 'The verified catalog is being prepared'}</h2><p className="mt-3 text-sm text-black/50">{hasFilters ? 'Try another search or clear the filters.' : 'The company team can publish confirmed products from the Admin Product Catalog.'}</p></div>}
    </div></div></section>;
}
