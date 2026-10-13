import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) { navigate('/'); return null; }
  const from = location.state?.from || '/';

  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await login(form); navigate(from, { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <section className="min-h-screen bg-[#f5f2eb] px-6 pb-24 pt-40"><div className="container-main grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
    <div><span className="eyebrow">Customer Account</span><h1 className="section-title mt-7">Welcome<br/><i className="text-black/40">back.</i></h1><p className="mt-7 max-w-md text-sm leading-7 text-black/55">Access your quotations, orders and future project updates from one secure account.</p></div>
    <form onSubmit={submit} className="bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,.06)] sm:p-10">
      <h2 className="font-serif text-3xl">Sign in</h2><p className="mt-2 text-sm text-black/50">Use the email connected to your Shahnawaz Enterprises account.</p>
      {error && <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <label className="mt-7 block text-[10px] font-bold uppercase tracking-[.16em]">Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-2 h-14 w-full border border-black/15 bg-[#faf9f6] px-4 outline-none focus:border-[#b18a55]" placeholder="you@example.com"/></label>
      <label className="mt-5 block text-[10px] font-bold uppercase tracking-[.16em]">Password<input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-2 h-14 w-full border border-black/15 bg-[#faf9f6] px-4 outline-none focus:border-[#b18a55]" placeholder="••••••••"/></label>
      <button disabled={busy} className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60">{busy?'Signing in…':'Sign In'}<ArrowRight size={15}/></button>
      <p className="mt-6 text-center text-sm text-black/50">New here? <Link className="font-semibold text-black underline" to="/register">Create an account</Link></p>
    </form>
  </div></section>;
}
