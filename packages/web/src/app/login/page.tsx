'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();
    console.log('preventDefault called, email:', email, 'password length:', password.length);
    setError(null);
    setLoading(true);

    try {
      console.log('Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase response:', { data, error });

      if (error) throw error;

      if (data.user) {
        console.log('Login successful, redirecting to /');
        // Refresh the page to trigger middleware with new auth cookies
        router.refresh();
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          {/* Wireframe Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 border-2 border-gray-800" />
              <div className="absolute inset-4 border border-gray-800" />
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 bg-gray-800" />
              <div className="absolute left-1/2 top-0 h-4 w-px bg-gray-800" />
              <div className="absolute bottom-0 left-1/2 h-4 w-px bg-gray-800" />
              <div className="absolute left-0 top-1/2 h-px w-4 bg-gray-800" />
              <div className="absolute right-0 top-1/2 h-px w-4 bg-gray-800" />
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight text-white">
            Lattice
          </h1>
          <p className="font-mono text-sm uppercase tracking-wider text-gray-500">
            Service Discovery Platform
          </p>
        </div>

        {/* Login Form */}
        <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="border-b border-gray-800 p-6">
            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-500">
              Sign In
            </h2>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
            {error && (
              <div className="border border-red-900 bg-red-950/20 p-4">
                <p className="font-mono text-sm text-red-500">{error}</p>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="border-t border-gray-800 pt-6 text-center">
              <span className="font-mono text-sm text-gray-500">
                Don&apos;t have an account?{' '}
              </span>
              <Link
                href="/signup"
                className="font-mono text-sm text-white hover:text-gray-300 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
