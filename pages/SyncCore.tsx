
import React from 'react';
import { Link } from 'react-router-dom';

const SyncCore: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 max-w-7xl mx-auto sticky top-0 z-50">
        <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</Link>
        <Link to="/infrastructure" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Back to Infra</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-32">
        <div className="mb-32">
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Core Protocol</span>
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8] mb-12 italic">Sync <br/><span className="text-blue-600">Core</span> v2.</h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
            The heart of BlueLedger is the synchronization engine. It handles high-concurrency requests by treating every inventory update as a "Sacred Transaction."
          </p>
        </div>

        {/* Protocol Visual */}
        <div className="bg-slate-900 p-20 text-white mb-32 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl"></div>
           <h3 className="text-2xl font-black uppercase mb-12 text-blue-500">Atomic Update Cycle</h3>
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-center w-40">
                 <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 font-black">POS</div>
                 <span className="text-[10px] uppercase font-bold text-slate-400">Terminal Intent</span>
              </div>
              <div className="w-12 h-px bg-blue-600 hidden md:block"></div>
              <div className="text-center w-40">
                 <div className="w-16 h-16 bg-blue-600 flex items-center justify-center mx-auto mb-4 font-black">SYNC</div>
                 <span className="text-[10px] uppercase font-bold text-slate-400">Atomic Commit</span>
              </div>
              <div className="w-12 h-px bg-blue-600 hidden md:block"></div>
              <div className="text-center w-40">
                 <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 font-black">HUB</div>
                 <span className="text-[10px] uppercase font-bold text-slate-400">Global Registry</span>
              </div>
           </div>
        </div>

        <section className="space-y-20 mb-32">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                 <h4 className="text-xl font-black uppercase mb-4">WebSocket Persistence</h4>
                 <p className="text-slate-500 text-sm leading-relaxed">Unlike standard REST APIs, Sync Core maintains a live socket connection. This means stock updates are pushed to worker terminals instantly, rather than waiting for a page refresh.</p>
              </div>
              <div>
                 <h4 className="text-xl font-black uppercase mb-4">Optimistic Locking</h4>
                 <p className="text-slate-500 text-sm leading-relaxed">The engine handles race conditions by timestamping every commit to the millisecond. In cases of conflict, the earliest verified transaction takes precedence.</p>
              </div>
           </div>
           
           <div className="p-12 border-2 border-slate-900 bg-white">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-6">Performance Benchmark</h4>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2"><span>Latency (ms)</span><span>94ms</span></div>
                    <div className="w-full h-2 bg-slate-100"><div className="w-[10%] h-full bg-blue-600"></div></div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2"><span>Sync Integrity (%)</span><span>99.9%</span></div>
                    <div className="w-full h-2 bg-slate-100"><div className="w-[100%] h-full bg-emerald-500"></div></div>
                 </div>
              </div>
           </div>
        </section>

        <div className="text-center">
           <Link to="/signup" className="px-12 py-6 bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all">Start Sync Integration</Link>
        </div>
      </main>
    </div>
  );
};

export default SyncCore;
