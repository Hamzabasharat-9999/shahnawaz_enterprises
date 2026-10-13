import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calculator as CalculatorIcon, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const empty = { productId: '', quantity: 1, length: '', width: '', height: '', unit: 'ft', material: 'MDF', finish: 'Matte' };
const money = (n) => `PKR ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function Calculator() {
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState(null);
  const [item, setItem] = useState(empty);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/products?limit=100'), api.get('/estimates/config')])
      .then(([p, c]) => { setProducts(p.items || []); setConfig(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const selected = useMemo(() => products.find((p) => p.id === item.productId), [products, item.productId]);

  const update = (key, value) => setItem((v) => ({ ...v, [key]: value }));

  async function calculate(e) {
    e.preventDefault(); setCalculating(true); setError('');
    try {
      const data = await api.post('/estimates/calculate', {
        productId: item.productId || undefined,
        quantity: Number(item.quantity),
        dimensions: { length: Number(item.length) || 0, width: Number(item.width) || 0, height: Number(item.height) || 0, unit: item.unit },
        material: item.material,
        finish: item.finish
      });
      setEstimate(data.estimate);
    } catch (e) { setError(e.message); } finally { setCalculating(false); }
  }

  function reset() { setItem(empty); setEstimate(null); setError(''); }

  return <section className="min-h-screen bg-[#f5f2eb] px-6 pb-28 pt-36">
    <div className="container-main max-w-6xl">
      <div className="grid gap-12 lg:grid-cols-[1fr_390px] lg:items-end">
        <div><span className="eyebrow"> Estimation Engine</span><h1 className="section-title mt-7">Know the project<br/><i className="text-black/40">before it begins.</i></h1><p className="section-copy mt-7">Build a transparent preliminary estimate using the selected product, dimensions, material, finish, labour, waste and project overhead assumptions.</p></div>
        <div className="border border-black/10 bg-white p-6"><div className="flex gap-3"><ShieldCheck className="mt-1" size={19}/><div><p className="text-sm font-semibold">Planning estimate</p><p className="mt-2 text-xs leading-6 text-black/50">This calculator is not a final company quotation. Rates are configurable planning defaults and should be replaced with verified company rates.</p></div></div></div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={calculate} className="bg-white p-7 sm:p-10">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#b18a55]">Project inputs</p><h2 className="mt-3 font-serif text-3xl">Configure one item</h2></div><CalculatorIcon size={22} className="text-black/30"/></div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">Product<select value={item.productId} onChange={e=>update('productId',e.target.value)}><option value="">Custom / no catalog product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — {p.category}</option>)}</select></label>
            <label>Quantity<input type="number" min="1" step="1" value={item.quantity} onChange={e=>update('quantity',e.target.value)} /></label>
            <label>Measurement unit<select value={item.unit} onChange={e=>update('unit',e.target.value)}><option>ft</option><option>m</option><option>in</option><option>cm</option></select></label>
            <label>Length<input type="number" min="0" step="0.01" value={item.length} onChange={e=>update('length',e.target.value)} placeholder="e.g. 12" /></label>
            <label>Width<input type="number" min="0" step="0.01" value={item.width} onChange={e=>update('width',e.target.value)} placeholder="e.g. 4" /></label>
            <label>Height<input type="number" min="0" step="0.01" value={item.height} onChange={e=>update('height',e.target.value)} placeholder="Optional" /></label>
            <label>Material<select value={item.material} onChange={e=>update('material',e.target.value)}><option value="">Default material</option>{config && Object.keys(config.materialRates).map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Finish<select value={item.finish} onChange={e=>update('finish',e.target.value)}><option value="">Default finish</option>{config && Object.keys(config.finishRates).map(x=><option key={x}>{x}</option>)}</select></label>
          </div>
          {selected && <div className="mt-7 border border-black/10 bg-[#faf9f6] p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-black/40">Selected product</p><div className="mt-2 flex items-center justify-between gap-4"><div><p className="font-serif text-xl">{selected.name}</p><p className="mt-1 text-xs text-black/45">{selected.category}</p></div><p className="text-right text-xs font-semibold">{selected.priceMode === 'starting' ? money(selected.basePrice) : 'Quote required'}</p></div></div>}
          {error && <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          <div className="mt-8 flex flex-wrap gap-3"><button disabled={calculating || loading} className="btn-primary disabled:opacity-50">{calculating ? 'Calculating…' : 'Calculate estimate'} <ArrowRight size={15}/></button><button type="button" onClick={reset} className="btn-secondary"><RotateCcw size={15}/> Reset</button></div>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-[#171714] p-7 text-white sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/40">Estimate result</p>{estimate ? <><p className="mt-4 font-serif text-5xl">{money(estimate.breakdown.total)}</p><p className="mt-3 text-xs leading-6 text-white/45">Preliminary total for {estimate.quantity} × {estimate.productName}.</p><div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm"><Row label="Material" value={money(estimate.breakdown.materialCost)}/><Row label="Finish" value={money(estimate.breakdown.finishCost)}/><Row label="Waste" value={money(estimate.breakdown.waste)}/><Row label="Labour" value={money(estimate.breakdown.labor)}/><Row label="Overhead" value={money(estimate.breakdown.overhead)}/><Row label="Contingency" value={money(estimate.breakdown.contingency)}/></div><Link to={item.productId ? `/quote?product=${item.productId}` : '/quote'} className="mt-8 flex items-center justify-center gap-2 bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[.15em] text-black">Continue to quotation <ArrowRight size={14}/></Link></> : <div className="py-12"><p className="font-serif text-3xl">Your estimate will appear here.</p><p className="mt-4 text-sm leading-7 text-white/50">Enter the project inputs and calculate to see a complete cost breakdown.</p></div>}</div>
          <div className="mt-4 border border-black/10 bg-white p-6 text-xs leading-6 text-black/50"><Save size={15} className="mb-3"/>Nothing is saved automatically. Use the quotation workflow to submit project requirements for company review.</div>
        </aside>
      </div>
    </div>
  </section>;
}
function Row({ label, value }) { return <div className="flex items-center justify-between gap-5"><span className="text-white/50">{label}</span><span>{value}</span></div>; }
