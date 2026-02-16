import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</Link>
          <Link to="/login" className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-6 py-2 shadow-lg shadow-slate-900/20 active:translate-y-0.5 transition-all">Operator Portal</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end mb-32">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic underline decoration-blue-600/30 underline-offset-8">Operation Protocol</span>
            <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">The Ledger <br/>Architecture.</h1>
          </div>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl animate-in fade-in slide-in-from-right duration-700 delay-100">
            BlueLedger isn't just a database; it's a high-frequency synchronization engine engineered to eliminate inventory drift across massive, distributed retail networks.
          </p>
        </div>

        {/* 3-Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 mb-32 shadow-2xl overflow-hidden">
          {[
            { 
              step: '01', 
              title: 'Registry Definition', 
              desc: 'Define your asset classes and pricing in our master registry. Every product is hashed and assigned a unique UUID to prevent duplication during high-frequency updates.',
              img: 'https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&q=80&w=600'
            },
            { 
              step: '02', 
              title: 'Node Authorization', 
              desc: 'Provision terminal workers with edge credentials. Each terminal creates a persistent WebSocket tunnel to our nearest node, maintaining sub-100ms sync integrity.',
              img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=600'
            },
            { 
              step: '03', 
              title: 'Atomic Commits', 
              desc: 'Every transaction is an atomic commit. If a sync fails, the terminal reverts the state instantly via local cache reconciliation, ensuring the ledger is never in an invalid state.',
              img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-12 border-r last:border-r-0 border-slate-200 group hover:bg-slate-900 hover:text-white transition-all duration-700 relative">
              <span className="text-6xl font-black text-blue-600 mb-8 block font-mono group-hover:translate-x-4 transition-transform">{item.step}</span>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 group-hover:text-slate-400 transition-colors h-24">{item.desc}</p>
              <div className="overflow-hidden h-40">
                <img src={item.img} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={item.title} />
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <section className="mb-32">
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-16">Sync Capability Benchmarks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-slate-100 border border-slate-200 p-1">
            <div className="bg-white p-12">
               <span className="text-rose-500 text-[9px] font-black uppercase tracking-widest mb-4 block">Legacy Infrastructure</span>
               <h4 className="text-xl font-black uppercase mb-6">Traditional Cloud DB</h4>
               <ul className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <li className="flex items-center space-x-2 text-rose-300"><span>✕</span> <span>Latency: 2s - 5s</span></li>
                  <li className="flex items-center space-x-2 text-rose-300"><span>✕</span> <span>Polling-based updates</span></li>
                  <li className="flex items-center space-x-2 text-rose-300"><span>✕</span> <span>Race-condition vulnerable</span></li>
               </ul>
            </div>
            <div className="bg-slate-900 text-white p-12">
               <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-4 block">BlueLedger Protocol</span>
               <h4 className="text-xl font-black uppercase mb-6">Sync Core Engine</h4>
               <ul className="space-y-4 text-xs font-bold text-white uppercase tracking-widest">
                  <li className="flex items-center space-x-2 text-blue-500"><span>✓</span> <span>Latency: &lt; 100ms</span></li>
                  <li className="flex items-center space-x-2 text-blue-500"><span>✓</span> <span>WebSocket Pushing</span></li>
                  <li className="flex items-center space-x-2 text-blue-500"><span>✓</span> <span>Atomic Locking</span></li>
               </ul>
            </div>
          </div>
        </section>

        {/* Deployment Timeline */}
        <section className="bg-slate-50 p-20 border border-slate-200 mb-32 shadow-inner">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-16 text-center">Standard Implementation Roadmap</h2>
          <div className="relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block"></div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {[
                  { time: 'T-01', task: 'Cloud Ingestion', detail: 'Registry setup and asset mapping.' },
                  { time: 'T-03', task: 'Terminal Sync', detail: 'Edge node configuration.' },
                  { time: 'T-05', task: 'Security Protocol', detail: 'RBAC and Sacred Field rules.' },
                  { time: 'T-07', task: 'Go-Live Sync', detail: 'Enterprise-wide ledger activation.' }
                ].map((t, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-black text-xs shadow-xl group-hover:scale-110 transition-transform">0{i+1}</div>
                    <h4 className="font-black uppercase text-sm mb-2">{t.time}</h4>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">{t.task}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter leading-relaxed">{t.detail}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        <div className="bg-slate-900 p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
           <div className="max-w-xl">
             <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">Ready to upgrade <br/>to precision sync?</h2>
             <p className="text-slate-400 text-sm leading-relaxed">Join 500+ enterprises who have eliminated inventory drift with BlueLedger.</p>
           </div>
           <Link to="/signup" className="px-12 py-6 bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-slate-900 transition-all shadow-xl active:translate-y-1">Provision My Ledger</Link>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;