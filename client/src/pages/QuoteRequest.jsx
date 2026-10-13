import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const blankItem = { product: '', quantity: 1, length: '', width: '', height: '', unit: 'ft', material: '', finish: '', notes: '' };

export default function QuoteRequest() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ projectTitle: '', projectType: '', siteAddress: '', preferredTimeline: '', budgetRange: '', customerNotes: '' });
  const [items, setItems] = useState([{ ...blankItem }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const params = new URLSearchParams(location.search);
  const initialProduct = params.get('product');

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/products?limit=48').then((d) => {
      setProducts(d.items);
      if (initialProduct && d.items.some((p) => p.id === initialProduct)) setItems([{ ...blankItem, product: initialProduct }]);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [isAuthenticated, initialProduct]);

  const estimatedSubtotal = useMemo(() => items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product);
    const unitPrice = product?.priceMode === 'starting' ? Number(product.basePrice || 0) : 0;
    return sum + unitPrice * Math.max(1, Number(item.quantity) || 1);
  }, 0), [items, products]);

  const updateItem = (index, key, value) => setItems((current) => current.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (!form.projectTitle.trim()) throw new Error('Please enter a project title.');
      if (items.some((i) => !i.product)) throw new Error('Please select a product for every quotation item.');
      const data = await api.post('/quotations', {
        ...form,
        items: items.map((i) => ({ product: i.product, quantity: Number(i.quantity), dimensions: { length: Number(i.length) || 0, width: Number(i.width) || 0, height: Number(i.height) || 0, unit: i.unit }, material: i.material, finish: i.finish, notes: i.notes }))
      }, { token });
      setSuccess(data.quotation); window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  if (!isAuthenticated) return <section className="min-h-screen bg-[#f5f2eb] px-6 pb-28 pt-40"><div className="container-main max-w-3xl"><span className="eyebrow">Quotation</span><h1 className="section-title mt-7">Sign in to request a project quotation.</h1><p className="section-copy mt-6">Your quotation requests are saved to your customer account so you can track their progress.</p><Link to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} className="btn-primary mt-9">Sign in to continue</Link></div></section>;

  if (success) return <section className="min-h-screen bg-[#f5f2eb] px-6 pb-28 pt-40"><div className="container-main max-w-3xl"><div className="bg-[#171714] p-10 text-white sm:p-14"><div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20"><Check/></div><span className="mt-8 block text-[10px] font-bold uppercase tracking-[.18em] text-white/45">Request submitted</span><h1 className="mt-4 font-serif text-5xl leading-none">We have your project brief.</h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/60">Your quotation request <strong className="text-white">{success.quotationNumber}</strong> has been submitted for review. This preliminary estimate is not a final company quotation.</p><div className="mt-9 flex flex-wrap gap-3"><Link to={`/account/quotations/${success.id}`} className="btn-secondary border-white/20 text-white hover:bg-white hover:text-black">View quotation</Link><Link to="/products" className="btn-secondary border-white/20 text-white hover:bg-white hover:text-black">Browse products</Link></div></div></div></section>;

  return <section className="min-h-screen bg-[#f5f2eb] px-6 pb-28 pt-36"><div className="container-main max-w-6xl"><Link to="/products" className="inline-flex items-center gap-2 text-sm text-black/55"><ArrowLeft size={15}/> Back to catalog</Link><div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start"><div><span className="eyebrow">Module 4 · Custom Quotation</span><h1 className="section-title mt-7">Tell us about<br/><i className="text-black/40">your project.</i></h1><p className="section-copy mt-6">Share the products, dimensions, materials and project requirements you already know. Our team can review the request and prepare the final quotation.</p></div><div className="bg-white p-7"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-black/40">Preliminary estimate</p><p className="mt-3 font-serif text-4xl">PKR {estimatedSubtotal.toLocaleString()}</p><p className="mt-2 text-xs leading-5 text-black/45">Only products with a starting price contribute to this estimate. Quote-only products are reviewed manually.</p></div></div>
    <form onSubmit={submit} className="mt-20 grid gap-8 lg:grid-cols-[1fr_330px]"><div className="space-y-8"><div className="bg-white p-7 sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#b18a55]">01 · Project</p><div className="mt-7 grid gap-5 md:grid-cols-2"><label>Project title<input value={form.projectTitle} onChange={e=>updateForm('projectTitle',e.target.value)} placeholder="e.g. Office interior fit-out" required/></label><label>Project type<input value={form.projectType} onChange={e=>updateForm('projectType',e.target.value)} placeholder="Residential / Commercial / Other"/></label><label className="md:col-span-2">Site address<textarea rows="3" value={form.siteAddress} onChange={e=>updateForm('siteAddress',e.target.value)} placeholder="Where will the work take place?"/></label><label>Preferred timeline<input value={form.preferredTimeline} onChange={e=>updateForm('preferredTimeline',e.target.value)} placeholder="e.g. Within 2 months"/></label><label>Budget range<input value={form.budgetRange} onChange={e=>updateForm('budgetRange',e.target.value)} placeholder="Optional"/></label><label className="md:col-span-2">Additional requirements<textarea rows="5" value={form.customerNotes} onChange={e=>updateForm('customerNotes',e.target.value)} placeholder="Tell us about style, scope, special requirements or anything else."/></label></div></div>
      <div className="bg-white p-7 sm:p-10"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#b18a55]">02 · Products</p><h2 className="mt-3 font-serif text-3xl">What do you need?</h2></div><button type="button" onClick={()=>setItems([...items,{...blankItem}])} className="btn-secondary !min-h-11 !px-4"><Plus size={15}/> Add item</button></div><div className="mt-8 space-y-7">{items.map((item,index)=><div key={index} className="border border-black/10 p-5 sm:p-7"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-black/40">Item {String(index+1).padStart(2,'0')}</span>{items.length>1&&<button type="button" onClick={()=>setItems(items.filter((_,i)=>i!==index))} className="text-black/40 hover:text-red-700"><Trash2 size={16}/></button>}</div><div className="mt-5 grid gap-5 md:grid-cols-2"><label className="md:col-span-2">Product<select value={item.product} onChange={e=>updateItem(index,'product',e.target.value)} required><option value="">Select a product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — {p.category}</option>)}</select></label><label>Quantity<input type="number" min="1" value={item.quantity} onChange={e=>updateItem(index,'quantity',e.target.value)}/></label><label>Measurement unit<select value={item.unit} onChange={e=>updateItem(index,'unit',e.target.value)}><option>ft</option><option>m</option><option>in</option><option>cm</option></select></label><label>Length<input type="number" min="0" step="0.01" value={item.length} onChange={e=>updateItem(index,'length',e.target.value)} placeholder="Optional"/></label><label>Width<input type="number" min="0" step="0.01" value={item.width} onChange={e=>updateItem(index,'width',e.target.value)} placeholder="Optional"/></label><label>Height<input type="number" min="0" step="0.01" value={item.height} onChange={e=>updateItem(index,'height',e.target.value)} placeholder="Optional"/></label><label>Material<input value={item.material} onChange={e=>updateItem(index,'material',e.target.value)} placeholder="e.g. MDF / solid wood"/></label><label>Finish<input value={item.finish} onChange={e=>updateItem(index,'finish',e.target.value)} placeholder="e.g. matte / laminate"/></label><label className="md:col-span-2">Item notes<textarea rows="3" value={item.notes} onChange={e=>updateItem(index,'notes',e.target.value)} placeholder="Any special requirement for this item?"/></label></div></div>)}</div></div></div>
      <aside className="space-y-5 lg:sticky lg:top-28"><div className="bg-[#171714] p-7 text-white"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/40">03 · Submit</p><h2 className="mt-4 font-serif text-3xl">Ready for review?</h2><p className="mt-4 text-sm leading-7 text-white/55">We'll review the information and can follow up for measurements, material choices or other project details.</p>{error&&<div className="mt-5 border border-red-300/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}<button disabled={saving||loading} className="mt-7 flex w-full items-center justify-center gap-2 bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[.15em] text-black disabled:opacity-50">{saving?'Submitting…':'Submit quotation request'}<Check size={14}/></button></div><div className="border border-black/10 bg-white p-6 text-xs leading-6 text-black/50">Your preliminary estimate is informational only. The final price depends on site conditions, dimensions, materials, finishes, quantities, labour and other project requirements.</div></aside></form></div></section>;
}
