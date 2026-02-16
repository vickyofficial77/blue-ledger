
import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="h-20 border-b border-slate-100 flex items-center justify-between px-6 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</Link>
        <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connect</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center mb-40">
           <div className="animate-in fade-in slide-in-from-left duration-700">
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block italic">Our Philosophy</span>
              <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8] mb-12 italic">The Truth <br/>in Numbers.</h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                 We believe inventory is the lifeblood of enterprise. Inaccuracy is a lethal friction. BlueLedger was built to eliminate that friction through mathematical precision and high-frequency synchronization.
              </p>
           </div>
           <div className="relative">
              <div className="absolute -inset-10 bg-blue-50 blur-3xl rounded-full"></div>
              <img src="https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&q=80&w=1200" className="relative grayscale border-4 border-slate-900 shadow-2xl" alt="Ledger Concept" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-40">
           <div>
              <h4 className="text-2xl font-black uppercase mb-6 tracking-tight">01. Accuracy</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Inventory drift is a choice. We provide the tools to make it a choice of the past through atomic transaction logging.</p>
           </div>
           <div>
              <h4 className="text-2xl font-black uppercase mb-6 tracking-tight">02. Velocity</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Data should move as fast as your customers. Our sync core ensures global availability in under 100 milliseconds.</p>
           </div>
           <div>
              <h4 className="text-2xl font-black uppercase mb-6 tracking-tight">03. Resilience</h4>
              <p className="text-slate-500 text-sm leading-relaxed">System failure is not an option. Our multi-node redundancy ensures your ledger is always reachable, always operational.</p>
           </div>
        </div>

        <section className="bg-slate-900 p-20 text-white text-center">
           <h3 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-none">Built by engineers. <br/>Trusted by operators.</h3>
           <Link to="/signup" className="inline-block px-12 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-slate-900 transition-all">Join the Network</Link>
        </section>
      </main>
    </div>
  );
};

export default About;
