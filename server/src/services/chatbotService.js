import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Appointment from '../models/Appointment.js';
import { COMPANY_PROFILE } from '../config/companyProfile.js';

const COMPANY = { name: COMPANY_PROFILE.name, tagline: COMPANY_PROFILE.tagline, services: COMPANY_PROFILE.services };

const FAQ = [
  { keys:['service','services','do','offer'], answer:`${COMPANY.name} provides ${COMPANY.services.join(', ')}.` },
  { keys:['quote','quotation','estimate','price'], answer:'You can request a quotation from a product page or use the quotation workflow. Preliminary estimates are available through the Cost Calculator, while final prices depend on the approved project quotation.' },
  { keys:['appointment','consultation','meeting','book'], answer:'You can book a consultation from the Appointments page. Available slots are generated from the configured business schedule.' },
  { keys:['delivery','deliver','shipping'], answer:'Delivery is managed after an order reaches the delivery stage. Customers can view scheduled delivery details and location information from their order area.' },
  { keys:['invoice','payment','pay'], answer:'Invoices are connected to orders. Customers can view invoice totals, payments and balance due from their account. Payment methods depend on the invoice configuration.' },
  { keys:['review','feedback','rating'], answer:'Customers with delivered or completed orders can submit a verified review, which is moderated before publication.' },
  { keys:['recommend','recommendation','product','choose'], answer:'Use SmartMatch from the AI Recommendations page. It ranks products using project type, budget, materials, finishes, style and priorities.' }
];

function normalize(value='') { return String(value).toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(); }
function scoreText(query, text='') {
  const q = normalize(query).split(' ').filter(w=>w.length>2);
  const t = normalize(text);
  return q.reduce((n,w)=>n+(t.includes(w)?1:0),0);
}

async function buildContext(message, user) {
  const products = await Product.find({status:'active'}).sort({featured:-1,updatedAt:-1}).limit(80).lean();
  const ranked = products.map(p=>({p,s:scoreText(message,[p.name,p.category,p.shortDescription,p.description,(p.tags||[]).join(' '),JSON.stringify(p.specifications||{})].join(' '))}))
    .filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,6).map(x=>x.p);

  const context = {company:{...COMPANY, contact:COMPANY_PROFILE.contact, social:COMPANY_PROFILE.social, mission:COMPANY_PROFILE.mission, vision:COMPANY_PROFILE.vision}, products:ranked.map(p=>({id:p._id,name:p.name,slug:p.slug,category:p.category,description:p.shortDescription||p.description,priceMode:p.priceMode,basePrice:p.basePrice,tags:p.tags})), faq:FAQ};

  if (user) {
    const [orders,invoices,appointments] = await Promise.all([
      Order.find({customer:user._id}).sort({createdAt:-1}).limit(5).select('orderNumber projectTitle status total currency createdAt').lean(),
      Invoice.find({customer:user._id}).sort({createdAt:-1}).limit(5).select('invoiceNumber projectTitle status total paidAmount balanceDue currency dueDate').lean(),
      Appointment.find({customer:user._id}).sort({date:1,startTime:1}).limit(5).select('appointmentNumber type date startTime endTime status').lean()
    ]);
    context.customer = {name:user.name, orders, invoices, appointments};
  }
  return context;
}

function deterministicReply(message, context) {
  const q=normalize(message);
  if (/\b(hi|hello|hey|salam|assalam)\b/.test(q)) return {answer:`Hello! 👋 I’m the ${COMPANY.name} AI assistant. I can help with products, recommendations, quotations, appointments, orders, delivery and invoices.`,links:[{label:'AI Recommendations',path:'/recommendations'},{label:'Book Consultation',path:'/appointments'}]};
  if (context.customer && /\b(my|status|order|orders|invoice|invoices|appointment|appointments)\b/.test(q)) {
    if (/invoice/.test(q)) return {answer:context.customer.invoices.length?`You have ${context.customer.invoices.length} recent invoice(s). ${context.customer.invoices.slice(0,3).map(i=>`${i.invoiceNumber}: ${i.status}, balance ${i.currency||'PKR'} ${Number(i.balanceDue||0).toLocaleString()}`).join(' · ')}`:'I could not find any invoices on your account.',links:[{label:'My Invoices',path:'/account/invoices'}]};
    if (/appointment/.test(q)) return {answer:context.customer.appointments.length?`Your recent appointments: ${context.customer.appointments.slice(0,3).map(a=>`${a.appointmentNumber}: ${a.status} on ${new Date(a.date).toLocaleDateString()} at ${a.startTime}`).join(' · ')}`:'You do not have any appointments yet.',links:[{label:'My Appointments',path:'/account/appointments'}]};
    return {answer:context.customer.orders.length?`Your recent orders: ${context.customer.orders.slice(0,3).map(o=>`${o.orderNumber}: ${o.status.replaceAll('_',' ')}`).join(' · ')}`:'You do not have any orders yet.',links:[{label:'My Orders',path:'/account/orders'}]};
  }
  const faq=FAQ.find(f=>f.keys.some(k=>q.includes(k)));
  if (faq) return {answer:faq.answer,links:q.includes('recommend')?[{label:'Try SmartMatch',path:'/recommendations'}]:q.includes('appointment')?[{label:'Book Consultation',path:'/appointments'}]:q.includes('review')?[{label:'Read Reviews',path:'/reviews'}]:[]};
  if (context.products.length) return {answer:`I found ${context.products.length} catalog match(es) related to your question: ${context.products.slice(0,3).map(p=>p.name).join(', ')}. Open the recommendations page if you want a more detailed project-based shortlist.`,links:[{label:'View Products',path:'/products'},{label:'SmartMatch',path:'/recommendations'}]};
  return {answer:'I can help with Shahnawaz Enterprises products, quotations, cost estimates, appointments, orders, delivery, invoices, reviews and AI recommendations. Tell me what you are planning, such as “I need modern storage for a bedroom”.',links:[{label:'Browse Products',path:'/products'},{label:'Get Recommendations',path:'/recommendations'}]};
}

async function geminiReply(message, history, context) {
  const key=process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
  const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const system=`You are the official customer assistant for ${COMPANY.name}, tagline "${COMPANY.tagline}". Only state facts supported by the provided business context. Never invent prices, certifications, business hours, project names, addresses, guarantees, stock quantities or policies. If information is missing, say it needs confirmation from the company. You may explain how to use the website. Keep replies concise, warm and practical. Do not expose private customer data beyond the authenticated user's own context. BUSINESS CONTEXT:\n${JSON.stringify(context)}`;
  const contents=[{role:'user',parts:[{text:system}]}];
  for (const h of (history||[]).slice(-8)) contents.push({role:h.role==='assistant'?'model':'user',parts:[{text:String(h.content||'').slice(0,2000)}]});
  contents.push({role:'user',parts:[{text:String(message).slice(0,2000)}]});
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents,generationConfig:{temperature:0.25,maxOutputTokens:500}})});
  if(!r.ok) return null;
  const data=await r.json();
  const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim();
  return text?{answer:text,links:[]}:null;
}

export async function chat({message,history,user}) {
  const context=await buildContext(message,user);
  let result=null; let usedGemini=false;
  try { result=await geminiReply(message,history,context); if(result) usedGemini=true; } catch {}
  if (!result) result=deterministicReply(message,context);
  return { ...result, engine: usedGemini ? 'gemini+catalog' : 'catalog-assistant', authenticated:!!user };
}
