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
            <img src="/logo.png" alt="Imperium" className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F5F3] mb-2">Admin Login</h1>
          <p className="text-[#9AA0A6] text-sm">Imperium Developments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 bg-[#2B2F33] p-6 sm:p-8 rounded-lg border border-[#F6F5F3]/5">
          <div className="space-y-2">
            <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2E2B23] border border-[#F6F5F3]/10 rounded-sm px-4 py-3 text-[#F6F5F3] focus:outline-none focus:border-[#C79E3D] transition-colors"
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
            className="w-full bg-[#C79E3D] hover:bg-[#F59E0B] text-[#0B0F14] font-medium py-3 rounded-sm transition-colors uppercase text-sm tracking-wide disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
