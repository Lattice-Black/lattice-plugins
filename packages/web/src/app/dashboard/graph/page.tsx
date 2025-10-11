import { Suspense } from 'react'
import Link from 'next/link'
import { fetchServices } from '@/lib/api'
import { NetworkGraph } from '@/components/NetworkGraph'
import { LoadingSpinner } from '@/components/Loading'

// Force dynamic rendering - authentication required
export const dynamic = 'force-dynamic'

async function GraphView() {
  const data = await fetchServices({ limit: 50 })

  if (!data.services || data.services.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-24 h-24 border-2 border-gray-800 mb-6 mx-auto relative">
            <div className="absolute inset-4 border border-gray-800" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No Services to Display
          </h2>
          <p className="text-sm text-gray-500 font-mono">
            Start your services with Lattice plugin to see the network graph
          </p>
        </div>
      </div>
    )
  }

  return <NetworkGraph services={data.services} />
}

export default function NetworkGraphPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Network Graph
            </h1>
            <p className="text-gray-500 font-mono text-sm">
              Visual representation of service connections and dependencies
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-colors font-mono"
            >
              Services
            </Link>
            <Link
              href="/dashboard/metrics"
              className="px-4 py-2 border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-colors font-mono"
            >
              Metrics
            </Link>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-6">
        <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
          Legend
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-gray-700 relative flex-shrink-0">
              <div className="absolute inset-2 border border-gray-800" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-700" />
            </div>
            <div>
              <div className="text-sm text-white font-mono">Active Service</div>
              <div className="text-xs text-gray-500">Currently running</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-gray-800 relative flex-shrink-0">
              <div className="absolute inset-2 border border-gray-900" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-mono">Inactive Service</div>
              <div className="text-xs text-gray-600">Not responding</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-px bg-gray-700" />
            </div>
            <div>
              <div className="text-sm text-white font-mono">Connection</div>
              <div className="text-xs text-gray-500">Service relationship</div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <Suspense fallback={<LoadingSpinner />}>
        <GraphView />
      </Suspense>
    </div>
  )
}
