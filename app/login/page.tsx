'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before checking auth to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if user is already authenticated (only after mount)
  useEffect(() => {
    if (!isMounted) return;

    async function checkAuth() {
      setCheckingAuth(true);
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (data.authenticated) {
          // Already logged in, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        // Not authenticated, continue to login page
        console.error('Auth check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    }
    
    checkAuth();
  }, [router, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Parse response JSON once
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails
        setError(response.statusText || 'Invalid response from server');
        setLoading(false);
        return;
      }

      // Check if response is ok
      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Check if login was successful
      if (!data.success) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Reset loading state before redirect
      setLoading(false);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Show loading while checking authentication (only after mount to prevent hydration mismatch)
  if (!isMounted || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
          <p className="text-white font-semibold">{isMounted ? 'Checking authentication...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800 px-4">
      <div className="max-w-md w-full">
        <div className="glass-dark rounded-lg shadow-xl p-8 border border-slate-700/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 text-elevated-strong">
              Operations Dashboard
            </h1>
            <p className="text-white/70 font-medium">Sign in to access analytics</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-md text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-bold text-white mb-2 text-elevated">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan border-slate-600"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white mb-2 text-elevated">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan border-slate-600"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-neon-blue text-white py-3 px-6 rounded-md font-bold hover-glow-blue transition-all duration-300 shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-elevated"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-neon-cyan hover:text-neon-blue text-sm font-bold transition-colors duration-300"
            >
              ← Back to website
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-white/50 text-center font-medium">
              Default credentials: admin / admin123
              <br />
              <span className="text-red-400">Change these in production!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

