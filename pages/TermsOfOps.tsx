
import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfOps: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-32 px-6 font-sans">
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</Link>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto bg-white p-20 shadow-[20px_20px_0px_#f1f5f9] border border-slate-200 border-t-8 border-slate-900">
        <span className="text-slate-900 text-[8px] font-black uppercase tracking-[0.5em] mb-4 block">Document: TERMS_OPS_v1.1</span>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Terms of <br/>Operations</h1>
        
        <div className="space-y-12 text-slate-600 text-sm leading-relaxed">
           <section>
              <h3 className="text-slate-900 font-black uppercase text-xs mb-4 tracking-widest">1. License of Use</h3>
              <p>The Operator is granted a non-exclusive license to use the BlueLedger Sync Core for the duration of the subscription period. Reverse engineering of the sync protocol is strictly forbidden.</p>
           </section>

           <section>
              <h3 className="text-slate-900 font-black uppercase text-xs mb-4 tracking-widest">2. Uptime Service Levels (SLA)</h3>
              <p>BlueLedger targets 99.9% uptime for the master registry. Planned maintenance windows are typically scheduled during "Cold Hours" (03:00 - 05:00 UTC) and will be broadcast via the Admin Terminal 48 hours prior.</p>
           </section>

           <section>
              <h3 className="text-slate-900 font-black uppercase text-xs mb-4 tracking-widest">3. Usage Restrictions</h3>
              <p>Automatic scraping or bot-committing to the registry without prior API authorization will trigger a permanent "IP Blackhole" protection. Every terminal must be tied to a verified operator identity.</p>
           </section>

           <section>
              <h3 className="text-slate-900 font-black uppercase text-xs mb-4 tracking-widest">4. Limitation of Liability</h3>
              <p>BlueLedger is a synchronization tool. While we maintain 99.9% reliability, we are not responsible for inventory losses occurring due to operator error, terminal power failure, or local network instability.</p>
           </section>

           <section className="pt-12 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 italic">By logging into the BlueLedger Terminal, you agree to these operational protocols.</p>
           </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfOps;
