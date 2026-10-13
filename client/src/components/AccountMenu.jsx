import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountMenu() {
  const { user, isAuthenticated, logout } = useAuth(); const navigate = useNavigate();
  if (!isAuthenticated) return <Link to="/login" className="hidden items-center gap-2 border border-white/25 px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] hover:bg-white hover:text-[#171714] lg:flex"><LogIn size={14}/> Login</Link>;
  return <div className="hidden items-center gap-3 lg:flex"><Link to="/account" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-white/70 hover:text-white"><UserRound size={14}/>{user?.name?.split(' ')[0] || 'Account'}</Link><button onClick={()=>{logout();navigate('/');}} className="text-white/40 hover:text-white" aria-label="Logout"><LogOut size={15}/></button></div>;
}
