import {ArrowUpRight} from 'lucide-react'; 
export default function CTA(){
  return <section className="bg-[#171714] py-24 text-white md:py-32">
    <div className="container-main grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <span className="eyebrow text-[#d1b07a]">Start a Conversation</span>
        <h2 className="mt-8 font-serif text-5xl text-white md:text-8xl">Have a project<br/><i className="text-white">in mind?</i></h2>
      </div>
      <div className="max-w-sm">
        <p className="text-sm leading-7 text-white/50">Tell us what you're looking for and let our team help turn your requirements into a complete interior solution.</p>
        <a href="#contact" style={{ color: '#000000' }} className="mt-8 inline-flex items-center gap-4 bg-[#e4d9c7] px-6 py-4 text-xs font-bold uppercase transition-colors hover:bg-[#d7c6ad] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Request a Quotation<ArrowUpRight size={16}/></a>
      </div>
    </div>
  </section>
}