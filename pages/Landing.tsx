import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col group">
            <span className="text-xl font-black uppercase tracking-tighter text-blue-600 group-hover:text-slate-900 transition-colors">BlueLedger</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">Enterprise Asset Sync</span>
          </Link>
          <div className="hidden md:flex space-x-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link to="/how-it-works" className="hover:text-blue-600 transition-colors">Process</Link>
            <Link to="/sectors" className="hover:text-blue-600 transition-colors">Sectors</Link>
            <Link to="/infrastructure" className="hover:text-blue-600 transition-colors">Infrastructure</Link>
          </div>
          <Link 
            to="/login" 
            className="group flex items-center space-x-3 bg-slate-900 text-white px-6 py-3 font-black uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all shadow-xl active:translate-y-0.5"
          >
            <span>Operator Login</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-48 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 border border-blue-100">
              Operational Intelligence v2.5
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-10 italic">
              Preci <br/><span className="text-blue-600">Inventory.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed mb-12">
              The absolute source of truth for your stock. BlueLedger synchronizes your entire supply chain from warehouse floors to retail terminals in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/signup" className="px-10 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl text-center">
                Register Enterprise
              </Link>
              <Link to="/login" className="px-10 py-5 bg-white border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all text-center">
                Operator Portal
              </Link>
            </div>
          </div>

          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="absolute -inset-10 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all"></div>
            <div className="relative border-4 border-slate-900 shadow-[40px_40px_0px_#f1f5f9]">
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200" 
                alt="Logistics Operations" 
                className="w-full h-[500px] object-cover filter grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute top-10 -right-10 bg-blue-600 p-8 text-white hidden md:block shadow-2xl">
                <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-2">Network Health</span>
                <span className="text-4xl font-black font-mono">100% UP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className="bg-slate-900 py-12 text-white overflow-hidden border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <span className="block text-3xl font-black font-mono mb-2 text-blue-500">100ms</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg Sync Latency</span>
          </div>
          <div>
            <span className="block text-3xl font-black font-mono mb-2 text-blue-500">99.99%</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Uptime</span>
          </div>
          <div>
            <span className="block text-3xl font-black font-mono mb-2 text-blue-500">1.2M+</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Commits</span>
          </div>
          <div>
            <span className="block text-3xl font-black font-mono mb-2 text-blue-500">500+</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enterprise Nodes</span>
          </div>
        </div>
      </section>

      {/* The 100ms Pulse - Technical Visualization */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div>
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Latency Benchmark</span>
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-10 italic">The sub-second <br/>Advantage.</h2>
              <p className="text-slate-500 mb-12 leading-relaxed">
                Legacy ERP systems rely on polling cycles that leave inventory blind spots for seconds or even minutes. BlueLedger’s WebSocket sync core reduces this window to under 100ms globally.
              </p>
              <div className="space-y-10">
                <div>
                   <div className="flex justify-between text-[10px] font-black uppercase mb-3"><span>Traditional Cloud DB</span><span className="text-rose-500">2.5s Lag</span></div>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-rose-500"></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-[10px] font-black uppercase mb-3"><span>BlueLedger Sync Core</span><span className="text-blue-600">0.09s Lag</span></div>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[8%] h-full bg-blue-600"></div>
                   </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-12 border border-slate-200 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>
               </div>
               <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-8">Atomic Lifecycle</h4>
               <ul className="space-y-8 relative z-10">
                 {[
                   { label: 'Ingestion', desc: 'Registry validates asset UUID and hash integrity.' },
                   { label: 'Locking', desc: 'Atomic field isolation prevents race conditions.' },
                   { label: 'Broadcast', desc: 'WebSocket push to 500+ global edge nodes.' },
                   { label: 'Reconcile', desc: 'Distributed terminals update local caches instantly.' }
                 ].map((item, i) => (
                   <li key={i} className="flex items-start space-x-6">
                     <span className="text-blue-600 font-mono font-black pt-1">0{i+1}</span>
                     <div>
                       <span className="block text-xs font-black uppercase tracking-widest mb-1">{item.label}</span>
                       <span className="block text-[10px] font-bold text-slate-400 uppercase leading-relaxed">{item.desc}</span>
                     </div>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Breakdown */}
      <section className="py-40 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block underline underline-offset-8">Core Capabilities</span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">Built for <br/><span className="text-blue-600">Enterprise.</span></h2>
            </div>
            <Link to="/api-docs" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">View Technical Documentation →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 px-1 bg-slate-200 border border-slate-200">
            {[
              { title: 'Atomic Locking', desc: 'No more race conditions. Every inventory change is an atomic event, ensuring stock integrity across all locations instantly.' },
              { title: 'Edge Redundancy', desc: 'Our infrastructure utilizes globally distributed edge nodes to ensure sub-100ms processing wherever your terminal is located.' },
              { title: 'Sacred Field Protection', desc: 'Enterprise-grade security rules prevent workers from modifying critical asset metadata like pricing or UUIDs.' },
              { title: 'Real-time Telemetry', desc: 'Monitor terminal health, operator activity, and stock velocity through a unified operational command center.' },
              { title: 'Offline-First Sync', desc: 'Terminals maintain a local ledger cache that reconciles automatically when network connectivity is re-established.' },
              { title: 'Audit Trail Forensic', desc: 'Every single state change is logged with millisecond precision, creating an immutable history of your business.' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-12 hover:bg-slate-900 hover:text-white transition-all duration-500 group">
                <h4 className="text-xl font-black uppercase mb-6 tracking-tight group-hover:translate-x-2 transition-transform">{f.title}</h4>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Command vs Control - Roles Overview */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-24">
             <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">User Ecosystem</span>
             <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Command <span className="text-slate-300 mx-4">||</span> Control.</h2>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
              <div className="bg-white p-16 group">
                <div className="w-16 h-16 bg-slate-900 flex items-center justify-center mb-10 group-hover:bg-blue-600 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight mb-6">Admin <br/><span className="text-blue-600">Command.</span></h3>
                <p className="text-slate-500 mb-10 leading-relaxed italic">The nerve center of the operation. Admins manage the global registry, provision personnel, and analyze high-velocity sales telemetry.</p>
                <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <li className="flex items-center space-x-3 text-slate-900"><div className="w-1.5 h-1.5 bg-blue-600"></div><span>Personnel Provisioning</span></li>
                   <li className="flex items-center space-x-3 text-slate-900"><div className="w-1.5 h-1.5 bg-blue-600"></div><span>Master Registry CRUD</span></li>
                   <li className="flex items-center space-x-3 text-slate-900"><div className="w-1.5 h-1.5 bg-blue-600"></div><span>Forensic Audit Logs</span></li>
                </ul>
              </div>
              <div className="bg-white p-16 group">
                <div className="w-16 h-16 bg-white border-2 border-slate-900 flex items-center justify-center mb-10 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight mb-6">Worker <br/><span className="text-slate-400">Terminal.</span></h3>
                <p className="text-slate-500 mb-10 leading-relaxed italic">Built for the front lines. A minimalist, lightning-fast terminal designed for high-concurrency checkouts and instant stock reconciliation.</p>
                <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-slate-300"></div><span>Atomic Checkout Flow</span></li>
                   <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-slate-300"></div><span>Real-time Stock Feed</span></li>
                   <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-slate-300"></div><span>Edge-Node Persistence</span></li>
                </ul>
              </div>
           </div>
        </div>
      </section>

      {/* Industry Footprint - Sector Snapshot */}
      <section className="py-40 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="mb-24">
             <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Vertical Integration</span>
             <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic italic">Market <br/>Sectors.</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { sector: 'Global Retail', stat: '100ms Sync', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400' },
                { sector: 'Industrial Logistics', stat: 'Edge Redundancy', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400' },
                { sector: 'Automotive Parts', stat: 'SKU Hierarchy', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=400' },
                { sector: 'Pharmaceuticals', stat: 'Field Security', img: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&q=80&w=400' }
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="overflow-hidden h-64 mb-6 border border-white/10 group-hover:border-blue-500 transition-all">
                    <img src={item.img} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={item.sector} />
                  </div>
                  <h4 className="font-black uppercase tracking-tight text-xl mb-2">{item.sector}</h4>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{item.stat}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] block italic">Operator Insights</span>
              <p className="text-4xl font-black uppercase tracking-tighter leading-tight italic">
                "BlueLedger eliminated our inventory drift within 48 hours of deployment. The sync speed is unlike anything we've tested in the cloud."
              </p>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-slate-900 flex-shrink-0 flex items-center justify-center font-black text-white text-xs">LOGI</div>
                <div>
                  <span className="block font-black uppercase text-sm">Marcus Vane</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Director of Logistics, Nexus.corp</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 border border-slate-200 shadow-xl group hover:bg-blue-600 hover:text-white transition-all">
                <span className="block text-4xl font-black text-blue-600 group-hover:text-white mb-2 font-mono">94%</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100">Reduction in Errors</p>
              </div>
              <div className="p-8 bg-slate-50 border border-slate-200 shadow-xl group hover:bg-blue-600 hover:text-white transition-all">
                <span className="block text-4xl font-black text-blue-600 group-hover:text-white mb-2 font-mono">3.5x</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100">Sales Velocity Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 p-20 relative overflow-hidden text-center shadow-[40px_40px_0px_#2563eb]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <h2 className="text-white text-6xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Ready to scale <br/>your operations?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link to="/signup" className="px-12 py-6 bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-slate-900 transition-all active:translate-y-1 shadow-2xl">
                Provision Registry
              </Link>
              <Link to="/login" className="px-12 py-6 border-2 border-white/20 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                Operator Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex flex-col">
              <span className="text-2xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-2">© 2025 BlueLedger Systems LLC. <br/>Precision Operations Guaranteed.</span>
            </div>
            <div className="flex space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-400 underline decoration-slate-200 underline-offset-4">
              <a href="#" className="hover:text-blue-600">Twitter</a>
              <a href="#" className="hover:text-blue-600">Github</a>
              <a href="#" className="hover:text-blue-600">Discord</a>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Infrastructure</h4>
            <div className="flex flex-col space-y-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Link to="/sync-core" className="hover:text-blue-600">Sync Core v2.5</Link>
              <Link to="/security-rules" className="hover:text-blue-600">Security Rules</Link>
              <Link to="/api-docs" className="hover:text-blue-600">Developer API</Link>
              <Link to="/infrastructure" className="hover:text-blue-600">Network Map</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Legal & Support</h4>
            <div className="flex flex-col space-y-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Link to="/privacy-policy" className="hover:text-blue-600">Privacy Protocol</Link>
              <Link to="/terms-of-ops" className="hover:text-blue-600">Terms of Ops</Link>
              <Link to="/contact" className="hover:text-blue-600">Connect Support</Link>
              <Link to="/about" className="hover:text-blue-600">About Mission</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;