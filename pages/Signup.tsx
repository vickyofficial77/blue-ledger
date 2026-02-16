import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { auth, db } from '../firebase';
import { UserRole } from '../types';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
      const user = userCredential.user;

      if (user) {
        // Multi-tenant key: each Admin's companyId is their uid
        const companyId = user.uid;

        await db.collection('users').doc(user.uid).set({
          uid: user.uid,
          name: formData.name,
          companyName: formData.companyName,
          email: formData.email,
          role: UserRole.ADMIN,
          companyId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Optional but recommended: keep a companies collection
        await db.collection('companies').doc(companyId).set(
          {
            companyId,
            companyName: formData.companyName,
            ownerUid: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-50 relative">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-10 left-10 flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Return to Hub</span>
      </Link>

      <div className="w-full max-w-md p-10 bg-white shadow-[10px_10px_0px_rgba(37,99,235,0.1)] border border-slate-200 rounded-none">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-slate-900 mx-auto flex items-center justify-center mb-6 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">System Setup</h1>
          <p className="text-slate-500 text-sm">Register your enterprise ledger</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border-l-4 border-red-500 rounded-none">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Admin Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-none focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Enterprise Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-none focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="Acme Global"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Master Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-none focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="admin@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Master Access Key</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-none focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-5 rounded-none transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50 shadow-xl"
          >
            {loading ? 'Initializing...' : 'Provision Enterprise'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Existing System? <Link to="/login" className="text-blue-600 hover:underline">Authorize Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
