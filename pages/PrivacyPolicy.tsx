
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-32 px-6 font-sans">
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">BlueLedger</Link>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto bg-white p-20 shadow-[20px_20px_0px_#f1f5f9] border border-slate-200">
        <span className="text-blue-600 text-[8px] font-black uppercase tracking-[0.5em] mb-4 block">Document: PRIV_v2.5</span>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Privacy Protocol</h1>
        
        <div className="space-y-12 text-slate-600 text-sm leading-relaxed">
           <section>
              <h3 className="text-slate-900 font-black uppercase text-xs mb-4 tracking-widest">1. Data Ingestion & Encapsulation</h3>
              <p className="mb-4">BlueLedger processes asset registry data solely for the purpose of synchronization. We do not sell or monetize individual terminal data.</p>
              <ul className="list-disc pl-6 space-y-2 text-xs">
                 <li>Operator Credentials (Name, Email)</li>
                 <li>Transaction Metadata (Timestamp, Quantity)</li>
                 <li>Terminal Diagnostics (IP, Latency, Auth Status)</li>
              </ul>
           </section>

           <section>
              <h3 className="text-slate-900 font-black uppercase text-xs mb-4 tracking-widest">2. Atomic Storage Integrity</h3>
              <p>Data stored in the BlueLedger core registry is encrypted at rest using AES-256 standards. Our personnel have zero access to your specific pricing or inventory totals unless explicitly authorized via a Support Tunnel.</p>
           </section>

           <section>
              <h3 className="text-slate-900 font-black uppercase text-xs mb-4 tracking-widest">3. Global Data Sovereignty</h3>
              <p>BlueLedger respects GDPR, CCPA, and HIPAA requirements. Users may request a full "Atomic Purge" of their enterprise registry at any time, which irrevocably deletes all cloud and edge node data within 24 hours.</p>
           </section>

           <section className="pt-12 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 italic">Last Revision: Oct 2025. Approved by Protocol Safety Board.</p>
           </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
