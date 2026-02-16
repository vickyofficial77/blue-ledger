
import React from 'react';
import { Link } from 'react-router-dom';

const SecurityRules: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="h-20 border-b border-slate-100 flex items-center justify-between px-6 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</Link>
        <Link to="/api-docs" className="text-[10px] font-black uppercase tracking-widest text-slate-400">View Docs</Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-32">
        <div className="max-w-3xl mb-32">
           <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Trust Architecture</span>
           <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8] italic mb-12">Sacred Field <br/><span className="text-blue-600">Protection.</span></h1>
           <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Security is the primary directive. We utilize "Sacred Field" logic to ensure that once an asset is defined, only authorized administrators can modify its core attributes (Price, UUID, Category).
           </p>
        </div>

        {/* RBAC Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
           <div className="p-12 border-4 border-slate-900">
              <span className="bg-slate-900 text-white text-[10px] px-3 py-1 font-black uppercase tracking-widest mb-6 inline-block">Role: ADMIN</span>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-tight text-slate-600">
                 <li className="flex items-center space-x-3 text-slate-900">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    <span>Full Registry CRUD</span>
                 </li>
                 <li className="flex items-center space-x-3 text-slate-900">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    <span>Personnel Provisioning</span>
                 </li>
                 <li className="flex items-center space-x-3 text-slate-900">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    <span>Historical Sales Export</span>
                 </li>
              </ul>
           </div>
           <div className="p-12 border border-slate-200">
              <span className="bg-slate-100 text-slate-400 text-[10px] px-3 py-1 font-black uppercase tracking-widest mb-6 inline-block">Role: WORKER</span>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-tight text-slate-400">
                 <li className="flex items-center space-x-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    <span>Atomic Sale Commit</span>
                 </li>
                 <li className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                    <span>Price Manipulation</span>
                 </li>
                 <li className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                    <span>Asset Purge (Delete)</span>
                 </li>
              </ul>
           </div>
        </div>

        <section className="bg-slate-50 p-20 border border-slate-200">
           <h3 className="text-2xl font-black uppercase mb-8">Encryption Standard</h3>
           <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mb-12">
              Every data point is encrypted via AES-256 before leaving the terminal. Our "Zero-Knowledge" storage protocol ensures that even in the event of a breach, individual product pricing and customer data remain unreadable.
           </p>
           <div className="flex space-x-6">
              <div className="px-6 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm">HIPAA Compliant</div>
              <div className="px-6 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm">GDPR Certified</div>
              <div className="px-6 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm">SOC2 Type II</div>
           </div>
        </section>
      </main>
    </div>
  );
};

export default SecurityRules;
