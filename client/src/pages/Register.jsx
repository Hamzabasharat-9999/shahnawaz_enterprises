import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate(); const { register, isAuthenticated } = useAuth();
  const [form,setForm]=useState({name:'',email:'',password:'',phone:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  if (isAuthenticated) { navigate('/'); return null; }
  const submit=async(e)=>{e.preventDefault();setError('');setBusy(true);try{await register(form);navigate('/');}catch(err){setError(err.message);}finally{setBusy(false);}};
  return <section className="min-h-screen bg-[#f5f2eb] px-6 pb-24 pt-40"><div className="container-main grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
    <div><span className="eyebrow">Customer Account</span><h1 className="section-title mt-7">Start your<br/><i className="text-black/40">journey.</i></h1><p className="mt-7 max-w-md text-sm leading-7 text-black/55">Create an account to keep your project enquiries, quotations and future orders organized.</p></div>
    <form onSubmit={submit} className="bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,.06)] sm:p-10"><h2 className="font-serif text-3xl">Create account</h2><p className="mt-2 text-sm text-black/50">Your account will start as a customer account.</p>
      {error&&<div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <label className="mt-7 block text-[10px] font-bold uppercase tracking-[.16em]">Full name<input required minLength="2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-2 h-14 w-full border border-black/15 bg-[#faf9f6] px-4 outline-none focus:border-[#b18a55]" placeholder="Your name"/></label>
      <label className="mt-5 block text-[10px] font-bold uppercase tracking-[.16em]">Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-2 h-14 w-full border border-black/15 bg-[#faf9f6] px-4 outline-none focus:border-[#b18a55]" placeholder="you@example.com"/></label>
      <label className="mt-5 block text-[10px] font-bold uppercase tracking-[.16em]">Phone <span className="font-normal normal-case tracking-normal text-black/40">(optional)</span><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="mt-2 h-14 w-full border border-black/15 bg-[#faf9f6] px-4 outline-none focus:border-[#b18a55]" placeholder="03XX XXXXXXX"/></label>
      <label className="mt-5 block text-[10px] font-bold uppercase tracking-[.16em]">Password<input required type="password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-2 h-14 w-full border border-black/15 bg-[#faf9f6] px-4 outline-none focus:border-[#b18a55]" placeholder="Minimum 6 characters"/></label>
      <button disabled={busy} className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60">{busy?'Creating…':'Create Account'}<ArrowRight size={15}/></button>
      <p className="mt-6 text-center text-sm text-black/50">Already registered? <Link className="font-semibold text-black underline" to="/login">Sign in</Link></p>
    </form>
  </div></section>;
}
