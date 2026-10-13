import {
  ArrowUpRight, Facebook, Instagram, MapPin, Mail, Phone,
  Clock3, MessageCircle, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANY_PROFILE, hasValue } from '../config/companyProfile';

function PinterestMark({ size = 17 }) {
  return <span aria-hidden="true" style={{ width: size, height: size }} className="inline-flex items-center justify-center font-serif text-[17px] font-bold leading-none">P</span>;
}

const socialChannels = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'pinterest', label: 'Pinterest', Icon: PinterestMark },
  { key: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle }
];

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Product Catalog', to: '/products' },
  { label: 'Project Portfolio', to: '/portfolio' },
  { label: 'Estimation Engine', to: '/calculator' },
  { label: 'Appointment Booking', to: '/appointments' },
  { label: 'Customer Reviews', to: '/reviews' }
];

function SocialLink({ channel, url }) {
  const { Icon, label } = channel;
  if (!hasValue(url)) {
    return (
      <span
        title={`${label} link not configured yet`}
        aria-label={`${label} link not configured yet`}
        className="flex h-10 w-10 cursor-default items-center justify-center rounded-full border border-white/10 bg-white/[.035] text-white/35"
      >
        <Icon size={17} strokeWidth={1.7} />
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[.035] text-white/70 transition duration-200 hover:-translate-y-0.5 hover:border-[#c8aa7b] hover:bg-[#c8aa7b] hover:text-[#171714] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8aa7b]"
    >
      <Icon size={17} strokeWidth={1.7} />
    </a>
  );
}

export default function Footer() {
  const profile = COMPANY_PROFILE;
  const contact = profile.contact || {};
  const social = profile.social || {};
  const services = (profile.services || []).map((service) => typeof service === 'string' ? service : service.title).filter(Boolean);

  const socialUrl = (key) => {
    const value = key === 'whatsapp' ? (social.whatsapp || contact.whatsapp || '') : (social[key] || '');
    if (!hasValue(value)) return '';
    if (key !== 'whatsapp' || /^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/[^\d]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  };

  return (
    <footer className="relative overflow-hidden bg-[#11110f] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-[#c8aa7b]/[.06] blur-3xl" />
      <div className="container-main relative py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_1fr_1.05fr] lg:gap-10">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label={`${profile.name} home`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#c8aa7b]/60 bg-white/[.03] font-serif text-2xl text-[#d7c6ad]">S</span>
              <span>
                <b className="block text-[11px] font-bold uppercase tracking-[.13em]">{profile.name}</b>
                <small className="mt-2 block text-[9px] uppercase tracking-[.24em] text-white/45">{profile.tagline}</small>
              </span>
            </Link>
            <h2 className="mt-8 max-w-xs font-serif text-4xl leading-[1.03] sm:text-5xl">Spaces made<br /><i className="text-[#c8aa7b]">thoughtful.</i></h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">
              Interior contracts, consultancy and general order supply. Share your project requirements with our team to discuss the right next steps.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {socialChannels.map((channel) => <SocialLink key={channel.key} channel={channel} url={socialUrl(channel.key)} />)}
            </div>
            {!socialChannels.some((channel) => hasValue(socialUrl(channel.key))) && (
              <p className="mt-3 text-[10px] leading-5 text-white/30">Social links will become active when official URLs are added to the company profile.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c8aa7b]">Explore</p>
            <ul className="mt-6 space-y-3.5">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="group inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white">
                    <ChevronRight size={13} className="text-[#c8aa7b]/70 transition-transform group-hover:translate-x-0.5" /> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c8aa7b]">What We Do</p>
            <ul className="mt-6 space-y-3.5">
              {services.map((service) => (
                <li key={service} className="text-sm leading-6 text-white/60">{service}</li>
              ))}
              <li><Link to="/quote" className="group mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#d7c6ad] transition hover:text-white">Discuss your project <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c8aa7b]">Showroom & Contact</p>
            <div className="mt-6 space-y-5">
              {hasValue(contact.address) ? (
                <div className="flex gap-3 text-sm leading-6 text-white/60">
                  <MapPin size={17} className="mt-1 shrink-0 text-[#c8aa7b]" />
                  <span>{contact.mapUrl ? <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">{contact.address}</a> : contact.address}</span>
                </div>
              ) : (
                <div className="flex gap-3 text-sm leading-6 text-white/45"><MapPin size={17} className="mt-1 shrink-0 text-[#c8aa7b]" /><span>Showroom address<br /><span className="text-xs text-white/30">Details to be confirmed</span></span></div>
              )}
              {hasValue(contact.phone) && <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-3 text-sm text-white/60 transition hover:text-white"><Phone size={16} className="shrink-0 text-[#c8aa7b]" />{contact.phone}</a>}
              {hasValue(contact.email) && <a href={`mailto:${contact.email}`} className="flex items-center gap-3 break-all text-sm text-white/60 transition hover:text-white"><Mail size={16} className="shrink-0 text-[#c8aa7b]" />{contact.email}</a>}
              {hasValue(contact.businessHours) ? (
                <div className="flex gap-3 text-sm leading-6 text-white/60"><Clock3 size={16} className="mt-1 shrink-0 text-[#c8aa7b]" /><span>{contact.businessHours}</span></div>
              ) : (
                <div className="flex gap-3 text-sm leading-6 text-white/45"><Clock3 size={16} className="mt-1 shrink-0 text-[#c8aa7b]" /><span>Operating hours<br /><span className="text-xs text-white/30">Details to be confirmed</span></span></div>
              )}
            </div>
            <Link to="/appointments" className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-white/75 transition hover:border-[#c8aa7b] hover:bg-[#c8aa7b] hover:text-[#171714]">
              Book a consultation <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[10px] uppercase tracking-[.12em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          <p>{profile.tagline}</p>
          <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-2 self-start transition hover:text-white sm:self-auto">Back to top <ArrowUpRight size={12} /></a>
        </div>
      </div>
    </footer>
  );
}
