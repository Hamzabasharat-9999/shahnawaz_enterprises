import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X, ArrowRight, UserRound, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COMPANY_PROFILE } from '../config/companyProfile';

const suggestedQuestions = [
  'What services do you offer?',
  'How do I request a quotation?',
  'How can I book a consultation?'
];

export default function FloatingChatWidget() {
  const { token } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to ${COMPANY_PROFILE.name}. I can help you explore our services, product catalog, quotations and appointments.`,
      links: []
    }
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, open]);

  if (location.pathname === '/chat') return null;

  async function sendMessage(text = input) {
    const message = String(text || '').trim();
    if (!message || loading) return;
    const next = [...messages, { role: 'user', content: message }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/chatbot/chat', {
        message,
        history: next.slice(-8).map(({ role, content }) => ({ role, content }))
      }, { token });
      setMessages((current) => [...current, {
        role: 'assistant',
        content: response.answer || 'I could not find a reliable answer for that yet.',
        links: response.links || []
      }]);
    } catch {
      setMessages((current) => [...current, {
        role: 'assistant',
        content: 'I cannot connect to the assistant right now. You can still browse products, request a quotation or book a consultation.',
        links: [
          { label: 'Products', path: '/products' },
          { label: 'Appointments', path: '/appointments' }
        ]
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          role="dialog"
          aria-label={`${COMPANY_PROFILE.name} chat assistant`}
          className="flex w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,.24)]"
        >
          <header className="flex items-center justify-between gap-3 bg-[#171714] px-4 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c8aa7b]/50 bg-white/[.06] text-[#d7c6ad]"><Bot size={19} /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{COMPANY_PROFILE.name} Assistant</p>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] text-white/50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Here to help with your project</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Close chat"><X size={18} /></button>
          </header>

          <div className="flex max-h-[min(54vh,460px)] min-h-[230px] flex-col gap-4 overflow-y-auto bg-[#faf9f6] p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role !== 'user' && <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e9e1d3] text-[#171714]"><Sparkles size={13} /></span>}
                <div className={`max-w-[84%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <p className={`inline-block whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-left text-xs leading-5 ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-[#171714] text-white'
                      : 'rounded-bl-md border border-black/[.04] bg-white text-black/75 shadow-sm'
                  }`}>{message.content}</p>
                  {message.links?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.links.map((link) => (
                        <Link key={`${link.path}-${link.label}`} to={link.path} onClick={() => setOpen(false)} className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#171714] transition hover:border-[#c8aa7b]">
                          {link.label} <ArrowRight size={11} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === 'user' && <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171714] text-white"><UserRound size={13} /></span>}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="mt-1">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[.14em] text-black/35">Popular questions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <button key={question} type="button" onClick={() => sendMessage(question)} className="rounded-full border border-black/10 bg-white px-3 py-2 text-left text-[10px] leading-4 text-black/65 transition hover:border-[#c8aa7b] hover:text-black">{question}</button>
                  ))}
                </div>
              </div>
            )}
            {loading && <p className="pl-9 text-xs text-black/40">Thinking…</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="border-t border-black/10 bg-white p-3">
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] p-1.5 pl-4 focus-within:border-[#b18a55]">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your project…"
                aria-label="Message the assistant"
                maxLength={2000}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-xs outline-none placeholder:text-black/35"
              />
              <button type="submit" disabled={loading || !input.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171714] text-white transition hover:bg-[#3a3328] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Send message">
                <Send size={14} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <span className="text-[9px] leading-4 text-black/35">Answers use available company information.</span>
              <Link to="/chat" onClick={() => setOpen(false)} className="inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold text-black/45 transition hover:text-black">Full chat <ExternalLink size={10} /></Link>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="group flex items-center gap-3 rounded-full border border-white/15 bg-[#171714] py-2 pl-2 pr-4 text-white shadow-[0_12px_36px_rgba(0,0,0,.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#29251e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8aa7b]"
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#c8aa7b] text-[#171714]">
          {open ? <X size={19} /> : <MessageCircle size={20} />}
          {!open && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#171714] bg-emerald-400" />}
        </span>
        <span className="text-left">
          <span className="block text-[11px] font-bold">Ask us anything</span>
          <span className="mt-0.5 block text-[9px] text-white/50">AI project assistant</span>
        </span>
      </button>
    </div>
  );
}
