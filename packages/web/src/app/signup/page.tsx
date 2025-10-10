'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.confirmed_at) {
          router.push('/');
          router.refresh();
        } else {
          setSuccess(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="w-full max-w-md">
          <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 border-2 border-green-900" />
                <div className="absolute inset-2 border border-green-900" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-mono text-sm uppercase tracking-wider text-white">
                Account Created
              </h2>
              <p className="font-mono text-xs text-gray-500">
                Please check your email to confirm your account
              </p>
            </div>

            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
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

        {/* Signup Form */}
        <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="border-b border-gray-800 p-6">
            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-500">
              Create Account
            </h2>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
            {error && (
              <div className="border border-red-900 bg-red-950/20 p-4">
                <p className="font-mono text-sm text-red-500">{error}</p>
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />

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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="border-t border-gray-800 pt-6 text-center">
              <span className="font-mono text-sm text-gray-500">
                Already have an account?{' '}
              </span>
              <Link
                href="/login"
                className="font-mono text-sm text-white hover:text-gray-300 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
