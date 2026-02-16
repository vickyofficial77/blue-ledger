import React from 'react';
import { Link } from 'react-router-dom';

const Enterprise: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-600/30">
      <nav className="h-20 border-b border-white/10 flex items-center justify-between px-6 max-w-7xl mx-auto sticky top-0 bg-slate-900/80 backdrop-blur-md z-50">
        <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-500">BlueLedger</Link>
        <div className="flex items-center space-x-8">
          <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Request Quote</Link>
          <Link to="/login" className="text-[10px] font-black uppercase tracking-widest border border-white/20 px-6 py-2 hover:bg-white hover:text-slate-900 transition-all">Operator Login</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-40">
        <div className="text-center mb-40">
           <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mb-6 block animate-pulse">Enterprise v2.5 Deployment</span>
           <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-12">Global <br/>Command.</h1>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Standardize your global inventory protocols. BlueLedger Enterprise provides a single pane of glass for multi-warehouse reconciliation, high-volume sales bursts, and military-grade security audits.
           </p>
        </div>

        {/* Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-1 bg-white/10 border border-white/10 mb-40 shadow-2xl">
           <div className="bg-slate-900 p-16 flex flex-col">
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4 block">Tier: Alpha</span>
              <h4 className="text-3xl font-black uppercase mb-8">Base Sync</h4>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed flex-grow">A high-fidelity foundation for growing businesses requiring real-time ledger integrity across single or dual-site operations.</p>
              <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-12">
                 <li className="flex items-center space-x-3 text-emerald-400"><span>•</span> <span>10 Active Terminals</span></li>
                 <li className="flex items-center space-x-3"><span>•</span> <span>100ms Target Latency</span></li>
                 <li className="flex items-center space-x-3"><span>•</span> <span>Standard Edge Support</span></li>
              </ul>
              <button className="w-full py-4 border border-white/20 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-slate-900 transition-all">Select Protocol</button>
           </div>
           
           <div className="bg-white text-slate-900 p-16 relative flex flex-col transform md:scale-105 shadow-[0_0_50px_rgba(37,99,235,0.2)] z-10">
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4 block">Tier: Gamma (Enterprise Gold)</span>
              <h4 className="text-3xl font-black uppercase mb-8">Precision Plus</h4>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed flex-grow">The industry standard for multi-regional distribution chains. Includes advanced forensic reporting and multi-layered RBAC.</p>
              <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-900 mb-12">
                 <li className="flex items-center space-x-3 text-blue-600"><span>•</span> <span>100 Active Terminals</span></li>
                 <li className="flex items-center space-x-3"><span>•</span> <span>50ms Target Latency</span></li>
                 <li className="flex items-center space-x-3"><span>•</span> <span>24/7 Response Protocol</span></li>
                 <li className="flex items-center space-x-3"><span>•</span> <span>Audit Trail Logs</span></li>
              </ul>
              <button className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl">Contact Sales</button>
           </div>

           <div className="bg-slate-900 p-16 flex flex-col">
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4 block">Tier: Omega</span>
              <h4 className="text-3xl font-black uppercase mb-8">Custom Core</h4>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed flex-grow">Dedicated private infrastructure for Fortune 500 organizations requiring custom SLOs and localized edge nodes.</p>
              <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-12">
                 <li className="flex items-center space-x-3 text-blue-400"><span>•</span> <span>Unlimited Terminals</span></li>
                 <li className="flex items-center space-x-3"><span>•</span> <span>Dedicated Hardware Node</span></li>
                 <li className="flex items-center space-x-3"><span>•</span> <span>Custom Legal Compliance</span></li>
              </ul>
              <button className="w-full py-4 border border-white/20 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-slate-900 transition-all">Request Architecture</button>
           </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
           <div>
              <h3 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-[0.9] italic">Unrivaled <br/><span className="text-blue-500">Service Level.</span></h3>
              <p className="text-slate-400 leading-relaxed mb-12">
                 We don't just host your data; we guarantee its availability through a legally binding Service Level Agreement. Our Enterprise SLA provides contractual uptime credits and direct 24/7 access to our engineering lead response team.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="border-l-2 border-blue-600 pl-6">
                  <span className="block text-2xl font-black mb-1">99.99%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Uptime Commitment</span>
                </div>
                <div className="border-l-2 border-slate-700 pl-6">
                  <span className="block text-2xl font-black mb-1">0.1ms</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Processing Overhead</span>
                </div>
              </div>
              <Link to="/contact" className="inline-block px-10 py-5 border-2 border-blue-600 text-blue-500 font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/10">Request Documentation</Link>
           </div>
           
           <div className="bg-white/5 p-12 border border-white/10 font-mono text-xs text-slate-500 shadow-inner group hover:bg-white/[0.07] transition-all">
              <div className="flex justify-between items-center mb-6">
                <p className="text-white font-black tracking-widest">SLA_GUARANTEE_V2.5</p>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
                 <p>{`{`}</p>
                 <p className="pl-4">"uptime_target": "99.99%",</p>
                 <p className="pl-4">"latency_max_threshold": "150ms",</p>
                 <p className="pl-4">"response_protocol": "&lt; 15min",</p>
                 <p className="pl-4">"redundancy_level": "Tier-4_Mesh",</p>
                 <p className="pl-4">"failover_mode": "automatic_edge_failover"</p>
                 <p>{`}`}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 text-[9px] uppercase tracking-widest">
                SYSTEM IDENTIFIER: BLUE_LEDGER_ENT_PRIME
              </div>
           </div>
        </section>

        {/* Global Clients Section */}
        <section className="border-t border-white/5 pt-40 text-center">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.6em] mb-12 block">Enterprise Integration Partners</span>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="text-2xl font-black italic tracking-tighter">NEXUS LOGISTICS</div>
            <div className="text-2xl font-black italic tracking-tighter">VERTEX GROUP</div>
            <div className="text-2xl font-black italic tracking-tighter">AETHER CORE</div>
            <div className="text-2xl font-black italic tracking-tighter">QUANTIX TECH</div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Enterprise;