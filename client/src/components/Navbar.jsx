import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../utils/constants';
import AccountMenu from './AccountMenu';
import { COMPANY_PROFILE } from '../config/companyProfile';

function isActive(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="border-b border-white/10 bg-[#171714]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,.12)] backdrop-blur-xl">
        <div className="container-main flex min-h-[78px] items-center justify-between gap-5">
          <Link to="/" className="group flex min-w-0 items-center gap-3" onClick={() => setOpen(false)} aria-label={`${COMPANY_PROFILE.name} home`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[#c8aa7b]/65 bg-white/[.03] font-serif text-xl text-[#d7c6ad] transition group-hover:bg-white/10">S</span>
            <span className="min-w-0 leading-none">
              <b className="block truncate text-[11px] font-bold uppercase tracking-[.13em] sm:text-xs">{COMPANY_PROFILE.name}</b>
              <small className="mt-2 block text-[9px] uppercase tracking-[.25em] text-white/45">{COMPANY_PROFILE.tagline}</small>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/[.07] bg-white/[.035] p-1 lg:flex">
            {NAVIGATION.map((item) => {
              const active = isActive(location.pathname, item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-3 py-2.5 text-[10px] font-semibold tracking-[.045em] transition-all duration-200 xl:px-3.5 xl:text-[11px] ${
                    active
                      ? 'border border-neutral-900 bg-neutral-900 text-white shadow-sm'
                      : 'border border-transparent text-white/65 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <AccountMenu />
            <Link to="/quote" className="group inline-flex items-center gap-2 rounded-full bg-[#c8aa7b] px-4 py-3 text-[10px] font-bold uppercase tracking-[.09em] text-[#171714] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:px-5">
              Request a Quote <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 transition hover:bg-white/10 lg:hidden"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/10 bg-[#171714] lg:hidden"
            >
              <div className="container-main py-5">
                <div className="grid gap-1">
                  {NAVIGATION.map((item) => {
                    const active = isActive(location.pathname, item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                          active ? 'bg-neutral-900 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {item.label}
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-[#b18a55]" />}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                  <Link to="/login" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center rounded-full border border-white/20 px-4 text-xs font-bold uppercase tracking-wider transition hover:bg-white/10">
                    Account
                  </Link>
                  <Link to="/quote" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c8aa7b] px-4 text-xs font-bold uppercase tracking-wider text-[#171714] transition hover:bg-white">
                    Request a Quote <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
