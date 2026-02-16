import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ApiDocs: React.FC = () => {
  const [lang, setLang] = useState('javascript');

  return (
    <div className="min-h-screen bg-white font-sans flex selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-100 p-10 hidden lg:block bg-slate-50 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-6 h-6 bg-blue-600"></div>
          <span className="text-xs font-black uppercase tracking-tighter">API CORE v2.5</span>
        </div>
        
        <nav className="space-y-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
           <div>
              <span className="text-slate-900 mb-4 block font-bold border-b border-slate-200 pb-2">Architecture</span>
              <div className="space-y-3 pl-4 pt-3">
                 <a href="#auth" className="block hover:text-blue-600 transition-colors">Authentication</a>
                 <a href="#registry" className="block hover:text-blue-600 transition-colors">Registry API</a>
                 <a href="#sync" className="block hover:text-blue-600 transition-colors">WebSocket Sync</a>
              </div>
           </div>
           <div>
              <span className="text-slate-900 mb-4 block font-bold border-b border-slate-200 pb-2">SDK Reference</span>
              <div className="space-y-3 pl-4 pt-3">
                 <button onClick={() => setLang('javascript')} className={`block text-left w-full hover:text-blue-600 transition-colors ${lang === 'javascript' ? 'text-blue-600' : ''}`}>Node.js</button>
                 <button onClick={() => setLang('python')} className={`block text-left w-full hover:text-blue-600 transition-colors ${lang === 'python' ? 'text-blue-600' : ''}`}>Python</button>
                 <button onClick={() => setLang('go')} className={`block text-left w-full hover:text-blue-600 transition-colors ${lang === 'go' ? 'text-blue-600' : ''}`}>GoLang</button>
              </div>
           </div>
           <div className="pt-10">
             <Link to="/contact" className="text-blue-600 hover:underline">Get Private Key →</Link>
           </div>
        </nav>
      </aside>

      <main className="flex-1 p-10 md:p-24 max-w-5xl">
        <Link to="/" className="text-[10px] font-black uppercase text-slate-400 mb-10 block hover:text-blue-600 transition-colors italic">← System Hub</Link>
        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-12 italic">Developer <br/><span className="text-blue-600">Interface.</span></h1>
        
        <section id="auth" className="mb-24 scroll-mt-24">
           <div className="flex items-center space-x-4 mb-8">
             <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black">SECURE</span>
             <h3 className="text-2xl font-black uppercase tracking-tight">Handshake Protocol</h3>
           </div>
           <p className="text-slate-500 mb-8 leading-relaxed max-w-2xl">
              All requests must be signed with an X-API-KEY header and a Bearer Token obtained from the Admin Terminal. Unauthorized attempts will be logged and trigger an IP blackhole after 5 failures.
           </p>
           <div className="bg-slate-900 p-8 rounded-none text-white font-mono text-xs mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none text-blue-500">HTTP/1.1</div>
              <span className="text-slate-500 italic">// Authorization Header Signature</span><br/>
              <span className="text-blue-400">Authorization:</span> Bearer YOUR_SECURE_TOKEN<br/>
              <span className="text-blue-400">X-Terminal-ID:</span> TERM_099<br/>
              <span className="text-blue-400">Content-Type:</span> application/json
           </div>
        </section>

        <section id="registry" className="mb-24 scroll-mt-24">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight">Atomic Synchronization</h3>
              <div className="flex space-x-1 p-1 bg-slate-100">
                 {['javascript', 'python', 'go'].map(l => (
                    <button key={l} onClick={() => setLang(l)} className={`px-4 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}>{l}</button>
                 ))}
              </div>
           </div>
           
           <div className="bg-slate-900 p-8 rounded-none text-white font-mono text-xs mb-12 shadow-2xl border-l-4 border-blue-600">
              {lang === 'javascript' && (
                <>
                  <span className="text-emerald-400">const</span> ledger = <span className="text-emerald-400">new</span> BlueLedger(<span className="text-blue-400">'API_KEY'</span>);<br/><br/>
                  <span className="text-slate-500">// Atomic Deduct Transaction</span><br/>
                  <span className="text-emerald-400">await</span> ledger.products.deduct(<span className="text-blue-400">'SKU_902'</span>, <span className="text-emerald-400">{`{ qty: 1 }`}</span>);<br/><br/>
                  <span className="text-slate-500">// Returns: {`{ success: true, latency: "42ms" }`}</span>
                </>
              )}
              {lang === 'python' && (
                <>
                  <span className="text-emerald-400">import</span> blueledger<br/><br/>
                  client = blueledger.Client(<span className="text-blue-400">"API_KEY"</span>)<br/><br/>
                  <span className="text-slate-500"># Deduct inventory units</span><br/>
                  response = client.products.deduct(<span className="text-blue-400">"SKU_902"</span>, qty=<span className="text-blue-400">1</span>)
                </>
              )}
              {lang === 'go' && (
                <>
                  ledger := blueledger.NewClient(<span className="text-blue-400">"API_KEY"</span>)<br/><br/>
                  <span className="text-slate-500">// Execute atomic deduction</span><br/>
                  err := ledger.Products.Deduct(<span className="text-blue-400">"SKU_902"</span>, <span className="text-blue-400">1</span>)
                </>
              )}
           </div>
        </section>

        <section id="limits" className="mb-24">
          <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-6">Service Rate Protocol</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="p-8 border border-slate-100 bg-slate-50">
               <span className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Standard Tier</span>
               <p className="text-2xl font-black mb-2 uppercase tracking-tighter">5k req/min</p>
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Across all terminals</p>
            </div>
            <div className="p-8 border border-slate-100 bg-slate-50">
               <span className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Enterprise Tier</span>
               <p className="text-2xl font-black mb-2 uppercase tracking-tighter">Unlimited</p>
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Custom Rate Allocation</p>
            </div>
          </div>
        </section>

        <div className="p-12 border-2 border-slate-900 bg-white text-center">
           <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-4">Integrity Disclaimer</h4>
           <p className="text-xs text-slate-400 leading-relaxed italic max-w-xl mx-auto">
             Any attempt to bypass WebSocket handshakes or manipulate registry pricing via API will result in a global system response &lt; 15min. 
           </p>
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;