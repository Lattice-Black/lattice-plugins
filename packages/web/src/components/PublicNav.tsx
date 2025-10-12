'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function PublicNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 border border-gray-500" />
                <div className="absolute inset-1 border border-gray-500" />
              </div>
              <span className="font-mono text-xl font-bold uppercase tracking-tight text-white">
                Lattice
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              <Link
                href="/docs"
                className="font-mono text-sm text-gray-400 hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/pricing"
                className="font-mono text-sm text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="font-mono text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="md">
                  Get Started
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <span className="w-6 h-0.5 bg-white transition-all" />
              <span className="w-6 h-0.5 bg-white transition-all" />
              <span className="w-6 h-0.5 bg-white transition-all" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={closeMobileMenu}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Menu Panel */}
          <div
            className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-black border-l border-gray-800 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end p-6">
              <button
                onClick={closeMobileMenu}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col gap-8 px-6 py-8">
              <Link
                href="/docs"
                onClick={closeMobileMenu}
                className="font-mono text-lg text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Docs
              </Link>
              <Link
                href="/pricing"
                onClick={closeMobileMenu}
                className="font-mono text-lg text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="font-mono text-lg text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Sign In
              </Link>
              <Link href="/signup" onClick={closeMobileMenu}>
                <Button variant="primary" size="lg" className="w-full">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
