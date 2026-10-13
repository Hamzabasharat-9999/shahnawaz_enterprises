import { chat } from '../services/chatbotService.js';
export async function chatEndpoint(req,res,next){
  try {
    const message=String(req.body?.message||'').trim();
    if(!message) return res.status(400).json({message:'Message is required.'});
    if(message.length>2000) return res.status(400).json({message:'Message is too long.'});
    const history=Array.isArray(req.body?.history)?req.body.history:[];
    const result=await chat({message,history,user:req.user});
    res.json(result);
  } catch(e){next(e);}
}
export function chatbotConfig(req,res){res.json({name:'Shahnawaz Enterprises AI Assistant',version:'1.0',features:['Catalog questions','Product discovery','SmartMatch guidance','Quotation guidance','Appointment guidance','Authenticated order/invoice/appointment summaries'],model:process.env.GEMINI_API_KEY?(process.env.GEMINI_MODEL||'gemini-2.5-flash'):'deterministic catalog assistant'});}
