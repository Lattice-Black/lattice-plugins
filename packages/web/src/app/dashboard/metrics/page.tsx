import { Suspense } from 'react'
import { fetchMetricsStats, fetchMetricsConnections } from '@/lib/api'
import type { ServiceMetricsStat, ServiceConnection } from '@/types'
import Link from 'next/link'


// Force dynamic rendering - authentication required
export const dynamic = 'force-dynamic'
async function MetricsStatsGrid() {
  const stats: ServiceMetricsStat[] = await fetchMetricsStats()

  if (!stats || stats.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 border border-gray-800 bg-black/50">
        <div className="text-center">
          <div className="font-mono text-sm text-gray-500 mb-2">
            No metrics data available
          </div>
          <p className="text-xs text-gray-600">
            Make some requests to your services to see metrics
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat: ServiceMetricsStat) => (
        <div key={stat.id} className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm hover:border-gray-700 transition-colors">
          {/* Service Name */}
          <div className="mb-6">
            <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
              Service
            </div>
            <div className="text-xl font-bold text-white truncate">
              {stat.name}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Requests */}
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                Requests
              </div>
              <div className="text-2xl font-bold text-white">
                {stat.total_requests || 0}
              </div>
            </div>

            {/* Avg Response Time */}
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                Avg Time
              </div>
              <div className="text-2xl font-bold text-white">
                {stat.avg_response_time_ms || 0}
                <span className="text-sm text-gray-500 ml-1">ms</span>
              </div>
            </div>

            {/* Error Rate */}
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                Error Rate
              </div>
              <div className={`text-2xl font-bold ${Number(stat.error_rate) > 5 ? 'text-red-500' : 'text-green-500'}`}>
                {Number(stat.error_rate || 0).toFixed(1)}%
              </div>
            </div>

            {/* Last Request */}
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                Last Request
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {stat.last_request_time ? new Date(stat.last_request_time).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function ConnectionsTable() {
  const connections: ServiceConnection[] = await fetchMetricsConnections()

  if (!connections || connections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 border border-gray-800 bg-black/50">
        <div className="text-center">
          <div className="font-mono text-sm text-gray-500 mb-2">
            No inter-service connections detected
          </div>
          <p className="text-xs text-gray-600">
            Services will appear here when they communicate with each other
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-800 bg-black/50 backdrop-blur-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left p-4 font-mono text-xs text-gray-500 uppercase tracking-wider">
              Source Service
            </th>
            <th className="text-left p-4 font-mono text-xs text-gray-500 uppercase tracking-wider">
              Target Service
            </th>
            <th className="text-right p-4 font-mono text-xs text-gray-500 uppercase tracking-wider">
              Call Count
            </th>
            <th className="text-right p-4 font-mono text-xs text-gray-500 uppercase tracking-wider">
              Avg Response Time
            </th>
          </tr>
        </thead>
        <tbody>
          {connections.map((conn: ServiceConnection, idx: number) => (
            <tr key={idx} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-900/50 transition-colors">
              <td className="p-4 text-white font-mono text-sm">
                {conn.source_service}
              </td>
              <td className="p-4 text-white font-mono text-sm">
                {conn.target_service}
              </td>
              <td className="p-4 text-right text-white font-bold">
                {conn.call_count}
              </td>
              <td className="p-4 text-right text-white">
                {conn.avg_response_time}
                <span className="text-sm text-gray-500 ml-1">ms</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MetricsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Runtime Metrics
            </h1>
            <p className="text-gray-500 font-mono text-sm">
              Real-time performance statistics from your services
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
              href="/dashboard/graph"
              className="px-4 py-2 border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-colors font-mono"
            >
              Network Graph
            </Link>
          </div>
        </div>
      </div>

      {/* Service Statistics */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-1">
            Service Statistics
          </h2>
          <p className="text-sm text-gray-500 font-mono">
            Last 1 hour of request data
          </p>
        </div>
        <Suspense fallback={
          <div className="border border-gray-800 p-12 bg-black/50 text-center">
            <div className="animate-pulse text-gray-500 font-mono">Loading metrics...</div>
          </div>
        }>
          <MetricsStatsGrid />
        </Suspense>
      </div>

      {/* Inter-Service Connections */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-1">
            Inter-Service Communication
          </h2>
          <p className="text-sm text-gray-500 font-mono">
            Service-to-service call patterns
          </p>
        </div>
        <Suspense fallback={
          <div className="border border-gray-800 p-12 bg-black/50 text-center">
            <div className="animate-pulse text-gray-500 font-mono">Loading connections...</div>
          </div>
        }>
          <ConnectionsTable />
        </Suspense>
      </div>
    </div>
  )
}
