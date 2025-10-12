import Link from 'next/link';
import { DotGrid } from '@/components/DotGrid';
import { PublicNav } from '@/components/PublicNav';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <DotGrid />

      <div className="relative z-10">
        <PublicNav />

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Decorative Icon */}
            <div className="mx-auto mb-12 flex h-24 w-24 items-center justify-center">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 border-2 border-gray-500" />
                <div className="absolute inset-4 border border-gray-500" />
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 bg-gray-500" />
                <div className="absolute left-1/2 top-0 h-4 w-px bg-gray-500" />
                <div className="absolute bottom-0 left-1/2 h-4 w-px bg-gray-500" />
                <div className="absolute left-0 top-1/2 h-px w-4 bg-gray-500" />
                <div className="absolute right-0 top-1/2 h-px w-4 bg-gray-500" />
              </div>
            </div>

            <h1 className="mb-6 text-6xl font-bold uppercase tracking-tight text-white">
              Service Discovery
              <br />
              Made Simple
            </h1>
            <p className="mb-12 text-xl text-gray-500 font-mono">
              Automatically discover, map, and monitor your microservices architecture.
              <br />
              Real-time visibility into your entire service ecosystem.
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="border border-white bg-white px-8 py-4 font-mono text-base uppercase tracking-wider text-black hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/docs"
                className="border border-gray-800 bg-black px-8 py-4 font-mono text-base uppercase tracking-wider text-white hover:border-gray-700 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-gray-800 bg-black/50 backdrop-blur-sm py-24">
          <div className="container mx-auto px-6">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="border border-gray-800 p-8">
                <div className="mb-4 h-12 w-12 border border-gray-800" />
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Auto-Discovery
                </h3>
                <p className="font-mono text-sm text-gray-500">
                  Plugins automatically detect and register your services, routes, and dependencies. No manual configuration required.
                </p>
              </div>

              <div className="border border-gray-800 p-8">
                <div className="mb-4 h-12 w-12 border border-gray-800" />
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Real-Time Monitoring
                </h3>
                <p className="font-mono text-sm text-gray-500">
                  Track service health, dependencies, and API routes in real-time. Visualize your architecture with interactive network graphs.
                </p>
              </div>

              <div className="border border-gray-800 p-8">
                <div className="mb-4 h-12 w-12 border border-gray-800" />
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Framework Support
                </h3>
                <p className="font-mono text-sm text-gray-500">
                  Works with Express, Next.js, and more. Drop-in plugins integrate with your existing stack in minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-16 text-center">
            <h2 className="mb-4 text-4xl font-bold uppercase tracking-tight text-white">
              Ready to Get Started?
            </h2>
            <p className="mb-8 font-mono text-lg text-gray-500">
              Start discovering your services in under 5 minutes.
            </p>
            <Link
              href="/signup"
              className="inline-block border border-white bg-white px-8 py-4 font-mono text-base uppercase tracking-wider text-black hover:bg-gray-100 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm py-12">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 border border-gray-500" />
                </div>
                <span className="font-mono text-sm text-gray-600">
                  © 2025 Lattice. All rights reserved.
                </span>
              </div>
              <div className="flex gap-6">
                <Link href="/docs" className="font-mono text-sm text-gray-600 hover:text-white transition-colors">
                  Documentation
                </Link>
                <Link href="/pricing" className="font-mono text-sm text-gray-600 hover:text-white transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
