import React from 'react';
import { Link } from 'react-router-dom';

const Sectors: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</Link>
          <div className="flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <Link to="/enterprise" className="hover:text-blue-600 transition-colors">Enterprise</Link>
             <Link to="/contact" className="hover:text-blue-600 transition-colors">Support</Link>
             <Link to="/login" className="bg-slate-900 text-white px-6 py-2">Terminal Login</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <div className="max-w-3xl mb-32">
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Target Verticals</span>
          <h1 className="text-8xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-12 italic">Vertical <br/><span className="text-blue-600">Sync.</span></h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
            From industrial supply chains to high-end luxury retail, BlueLedger provides the sub-second precision needed for complex, high-concurrency asset environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-32">
          {[
            { 
              title: 'Global Retail', 
              problem: 'Legacy POS lag causing inventory over-selling during high-volume flash sales.',
              solution: 'Atomic stock updates broadcast across 100+ stores in &lt; 100ms.',
              img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'
            },
            { 
              title: 'Industrial Logistics', 
              problem: 'Warehouse-to-terminal communication gaps in massive distribution hubs.',
              solution: 'Edge-node terminals with local-first cache and offline reconciliation.',
              img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
            },
            { 
              title: 'Automotive Parts', 
              problem: 'SKU misidentification leading to inventory drift across regional zones.',
              solution: 'Strict registry UUID tracking with nested category validation.',
              img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800'
            },
            { 
              title: 'Live Pop-Up Events', 
              problem: 'High-volume checkout in environments with unstable edge connectivity.',
              solution: 'Localized terminal sync protocol with secondary cloud verification.',
              img: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=800'
            }
          ].map((s, i) => (
            <div key={i} className="group pb-20 border-b border-slate-100 hover:border-blue-600 transition-all duration-700">
              <div className="overflow-hidden mb-12 h-96 relative">
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-all z-10"></div>
                <img src={s.img} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt={s.title} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-8 group-hover:translate-x-4 transition-transform">{s.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-3 block">Critical Friction</span>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.problem}</p>
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-3 block">Ledger Resolution</span>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.solution}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-40 bg-slate-50 p-20 text-center border border-slate-200">
           <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-none">Your sector is <br/>our specialization.</h2>
           <p className="text-slate-400 max-w-xl mx-auto mb-12 text-sm uppercase tracking-widest font-bold">Contact our vertical consultants for a custom implementation audit.</p>
           <Link to="/contact" className="inline-block px-12 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all">Request Industry Audit</Link>
        </section>
      </main>
    </div>
  );
};

export default Sectors;