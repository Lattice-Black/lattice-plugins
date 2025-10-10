import Link from 'next/link'
import { ServicesList } from '@/components/services-list'


// Force dynamic rendering - authentication required
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Service Discovery
            </h1>
            <p className="text-gray-500 font-mono text-sm">
              Real-time monitoring of discovered services and their metadata
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/metrics"
              className="px-4 py-2 border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-colors font-mono"
            >
              Metrics
            </Link>
            <Link
              href="/graph"
              className="px-4 py-2 border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-colors font-mono"
            >
              Network Graph
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview - Removed for now, will be added back with client-side rendering */}

      {/* Services Grid */}
      <ServicesList />
    </div>
  )
}
