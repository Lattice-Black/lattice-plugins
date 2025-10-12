'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-gray-800">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 border-2 border-white relative">
                <div className="absolute inset-1 border border-gray-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter text-white group-hover:text-gray-300 transition-colors">
                LATTICE
              </h1>
            </Link>
            {user && (
              <nav className="flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Services
                </Link>
                <Link
                  href="/dashboard/graph"
                  className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Network Graph
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Settings
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="font-mono text-xs text-gray-400">
                  {user.email}
                </span>
                <button
                  onClick={() => void signOut()}
                  className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                Service Discovery Platform
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
