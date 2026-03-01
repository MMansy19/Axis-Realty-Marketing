'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="22.5" y="4" width="3" height="40" rx="1.5" fill="#C79E3D" />
              <path d="M24 14L12 24L24 34" stroke="#F5F4F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M24 14L36 24L24 34" stroke="#F5F4F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <line x1="14" y1="24" x2="34" y2="24" stroke="#C79E3D" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F4F2] mb-2">Admin Login</h1>
          <p className="text-[#9AA0A6] text-sm">AXIS REALTY MARKETING</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 bg-[#1A1D21] p-6 sm:p-8 rounded-lg border border-[#F5F4F2]/5">
          <div className="space-y-2">
            <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#12161C] border border-[#F5F4F2]/10 rounded-sm px-4 py-3 text-[#F5F4F2] focus:outline-none focus:border-[#C79E3D] transition-colors"
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C79E3D] hover:bg-[#C79E3D]/90 text-[#0B0F14] font-medium py-3 rounded-sm transition-colors uppercase text-sm tracking-wide disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
