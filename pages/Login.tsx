
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (user) {
        const docSnap = await db.collection('users').doc(user.uid).get();
        
        if (docSnap.exists) {
          const userData = docSnap.data();
          if (userData?.role === UserRole.ADMIN) {
            navigate('/admin');
          } else {
            navigate('/worker');
          }
        } else {
          setError('User profile not found in database.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
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
          <div className="w-16 h-16 bg-blue-600 mx-auto flex items-center justify-center mb-6 shadow-xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
             </svg>
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2 uppercase tracking-tighter">Terminal Auth</h1>
          <p className="text-slate-500 text-sm">Secure entry to the sync protocol</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border-l-4 border-red-500 rounded-none">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Operator Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-4 border-2 border-slate-100 rounded-none focus:border-blue-500 outline-none transition-all text-sm font-mono"
              placeholder="operator@blueledger.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Access Key</label>
            <input
              type="password"
              required
              className="w-full px-4 py-4 border-2 border-slate-100 rounded-none focus:border-blue-500 outline-none transition-all text-sm font-mono"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-none transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50 shadow-lg active:translate-y-1"
          >
            {loading ? 'Validating...' : 'Authorize Login'}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            New System? <Link to="/signup" className="text-blue-600 hover:underline">Register Company</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
