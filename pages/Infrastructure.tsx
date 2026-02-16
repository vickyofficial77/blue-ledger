
import React from 'react';
import { Link } from 'react-router-dom';

const Infrastructure: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <nav className="h-20 border-b border-white/10 flex items-center justify-between px-6 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-500">BlueLedger</Link>
        <Link to="/api-docs" className="text-[10px] font-black uppercase tracking-widest border border-white/20 px-6 py-2">View API</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-40">
           <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">Backbone v2.0</span>
           <h1 className="text-8xl font-black uppercase tracking-tighter leading-none mb-12">Global <br/>Reach.</h1>
           <div className="w-px h-32 bg-blue-600 mx-auto"></div>
        </div>

        {/* Global Latency Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
           <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 blur-3xl rounded-full"></div>
              <img src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1200" className="relative grayscale opacity-60 border border-white/10 shadow-2xl" alt="Server Infrastructure" />
           </div>
           <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">Redundant <br/><span className="text-blue-500">Node Grid.</span></h2>
              <p className="text-slate-400 leading-relaxed mb-12">
                 BlueLedger utilizes a mesh network of Tier-4 data centers. If a primary node becomes unreachable, the terminal logic initiates an automatic failover to the secondary standby node in 3.5 seconds.
              </p>
              <div className="grid grid-cols-2 gap-8">
                 <div className="bg-white/5 p-8 border border-white/10">
                    <span className="text-3xl font-black font-mono">99.99%</span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Core Uptime</p>
                 </div>
                 <div className="bg-white/5 p-8 border border-white/10">
                    <span className="text-3xl font-black font-mono">256-AES</span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Sync Encryption</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-1 bg-white/10 border border-white/10 mb-40">
           {[
             { title: 'Edge Compute', desc: 'Localized execution of sync logic for zero-perceived latency.' },
             { title: 'Atomic DB', desc: 'NoSQL architecture with document-level locking mechanisms.' },
             { title: 'WebSocket Stream', desc: 'Bi-directional persistent pipes for instant ledger broadcasts.' }
           ].map((tech, i) => (
             <div key={i} className="bg-slate-900 p-16">
                <h4 className="text-xl font-black uppercase mb-6 text-blue-500">{tech.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{tech.desc}</p>
             </div>
           ))}
        </div>

        {/* Status Feed Conceptual */}
        <div className="bg-white/5 border border-white/10 p-12 font-mono text-xs text-slate-500">
           <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <span className="text-blue-500 font-bold uppercase">Infrastructure Status Monitor</span>
              <span className="text-emerald-500 animate-pulse uppercase">Operational</span>
           </div>
           <div className="space-y-4">
              <p>[14:22:01] SYNC_CORE_LOAD: 12.4%</p>
              <p>[14:22:04] NODE_US_EAST_01: STABLE (9ms)</p>
              <p>[14:22:09] NODE_EU_WEST_05: STABLE (21ms)</p>
              <p>[14:22:15] BROADCAST_PING: SUCCESSful_reconciliation</p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Infrastructure;
