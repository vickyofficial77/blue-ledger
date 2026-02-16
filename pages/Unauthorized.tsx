import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const attemptedPath =
    (location.state as any)?.from?.pathname || location.pathname || '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-900 text-center">
      <div className="p-12 bg-white border border-slate-200 shadow-[15px_15px_0px_#ef4444] max-w-sm w-full">
        <h1 className="text-8xl font-black text-red-500 mb-4 tracking-tighter">403</h1>

        <h2 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-[0.2em]">
          Access denied
        </h2>

        <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-widest">
          Your account doesn’t have permission to view this page.
        </p>

        {attemptedPath && (
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
            Requested: <span className="text-slate-500">{attemptedPath}</span>
          </p>
        )}

        <div className="mt-10 space-y-3">
          <Link
            to="/login"
            className="block bg-slate-900 text-white px-10 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-colors"
          >
            Return to Login
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="block w-full px-10 py-4 font-black uppercase tracking-widest text-[10px] border border-slate-200 text-slate-700 hover:border-slate-900 transition-colors"
          >
            Go Back
          </button>

          <Link
            to="/"
            className="block text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline decoration-2 underline-offset-4"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
