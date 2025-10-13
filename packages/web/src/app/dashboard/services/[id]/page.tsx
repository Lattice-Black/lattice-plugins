import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchServiceById, fetchRecentMetrics } from '@/lib/api'
import { formatDate, getRelativeTime } from '@/lib/utils'
import { LoadingSpinner } from '@/components/Loading'
import type { Route, Dependency, RecentMetricsResponse } from '@/types'


// Force dynamic rendering - authentication required
export const dynamic = 'force-dynamic'
interface ServiceDetailPageProps {
  params: {
    id: string
  }
}

async function ServiceDetails({ id }: { id: string }) {
  const service = await fetchServiceById(id)

  if (!service) {
    notFound()
  }

  const routes: Route[] = service.routes || []
  const dependencies: Dependency[] = service.dependencies || []

  // Fetch recent metrics for this service
  let metricsData: RecentMetricsResponse | null = null
  const routeMetrics: Record<string, { count: number; avgTime: number; errors: number; errorRate: number }> = {}

  try {
    metricsData = await fetchRecentMetrics(service.name)
    const metrics = metricsData.metrics || []

    // Calculate per-route statistics
    const stats: Record<string, { count: number; totalTime: number; errors: number }> = {}

    for (const metric of metrics) {
      const key = `${metric.method} ${metric.path}`
      if (!stats[key]) {
        stats[key] = { count: 0, totalTime: 0, errors: 0 }
      }
      stats[key].count++
      stats[key].totalTime += metric.response_time_ms
      if (metric.status_code >= 400) stats[key].errors++
    }

    // Convert to final format with averages
    for (const [key, data] of Object.entries(stats)) {
      routeMetrics[key] = {
        count: data.count,
        avgTime: Math.round(data.totalTime / data.count),
        errors: data.errors,
        errorRate: data.count > 0 ? (data.errors / data.count) * 100 : 0,
      }
    }
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
    // Continue without metrics - don't crash the page
  }

  const statusColor = {
    active: 'text-white bg-gray-900',
    inactive: 'text-gray-500 bg-gray-950',
    unknown: 'text-gray-600 bg-gray-950',
  }[service.status]

  const methodColors: Record<string, string> = {
    GET: 'text-green-400 border-green-900',
    POST: 'text-blue-400 border-blue-900',
    PUT: 'text-yellow-400 border-yellow-900',
    PATCH: 'text-orange-400 border-orange-900',
    DELETE: 'text-red-400 border-red-900',
    HEAD: 'text-gray-400 border-gray-800',
    OPTIONS: 'text-gray-400 border-gray-800',
    ALL: 'text-white border-gray-700',
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <Link
        href="/dashboard/services"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-mono uppercase tracking-wider"
      >
        <span>←</span> Back to Services
      </Link>

      {/* Service Header */}
      <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  {service.name}
                </h1>
                {service.version && (
                  <span className="px-3 py-1 border border-gray-800 bg-gray-900 font-mono text-sm text-gray-400">
                    v{service.version}
                  </span>
                )}
              </div>
              {service.description && (
                <p className="text-gray-400 text-lg">
                  {service.description}
                </p>
              )}
            </div>
            <div className={`px-4 py-2 border border-gray-800 font-mono text-sm uppercase tracking-wider ${statusColor}`}>
              {service.status}
            </div>
          </div>

          {/* Wireframe Diagram */}
          <div className="flex items-center justify-center py-8 border-y border-gray-800 my-6">
            <div className="relative w-48 h-48">
              {/* Outer box */}
              <div className="absolute inset-0 border-2 border-gray-700" />
              {/* Inner layers */}
              <div className="absolute inset-4 border border-gray-800" />
              <div className="absolute inset-8 border border-gray-800" />
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-700" />
              {/* Connection lines */}
              <div className="absolute top-0 left-1/2 w-px h-8 bg-gray-800" />
              <div className="absolute bottom-0 left-1/2 w-px h-8 bg-gray-800" />
              <div className="absolute left-0 top-1/2 h-px w-8 bg-gray-800" />
              <div className="absolute right-0 top-1/2 h-px w-8 bg-gray-800" />
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-sm font-mono text-gray-300">
              {service.framework}
            </span>
            <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-sm font-mono text-gray-300">
              {service.language}
            </span>
            {service.runtime && (
              <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-sm font-mono text-gray-300">
                {service.runtime}
              </span>
            )}
            {service.environment && (
              <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-sm font-mono text-gray-300">
                {service.environment}
              </span>
            )}
            {service.deploymentType && (
              <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-sm font-mono text-gray-300">
                {service.deploymentType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm">
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-3">
            Service ID
          </div>
          <div className="font-mono text-sm text-white break-all">
            {service.id}
          </div>
        </div>
        <div className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm">
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-3">
            First Seen
          </div>
          <div className="font-mono text-sm text-white">
            {formatDate(service.firstSeen)}
          </div>
        </div>
        <div className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm">
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-3">
            Last Seen
          </div>
          <div className="font-mono text-sm text-white">
            {getRelativeTime(service.lastSeen)}
          </div>
        </div>
      </div>

      {/* Discovery Info */}
      {service.discoveredBy && (
        <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Discovery Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                Plugin Name
              </div>
              <div className="font-mono text-sm text-white">
                {service.discoveredBy.pluginName}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                Plugin Version
              </div>
              <div className="font-mono text-sm text-white">
                {service.discoveredBy.pluginVersion}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                Schema Version
              </div>
              <div className="font-mono text-sm text-white">
                {service.discoveredBy.schemaVersion}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routes Section */}
      {routes.length > 0 && (
        <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">
              Routes ({routes.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {routes.map((route) => {
              const metricsKey = `${route.method} ${route.path}`
              const metrics = routeMetrics[metricsKey]

              return (
                <div key={route.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className={`px-2 py-1 border font-mono text-xs uppercase tracking-wider ${methodColors[route.method] || methodColors.GET}`}>
                      {route.method}
                    </span>
                    <div className="flex-1">
                      <div className="font-mono text-white mb-2">
                        {route.path}
                      </div>
                      {route.description && (
                        <div className="text-sm text-gray-500 mb-2">
                          {route.description}
                        </div>
                      )}

                      {/* Metrics Display */}
                      {metrics && (
                        <div className="flex gap-4 mt-3 mb-2">
                          <div className="px-3 py-1.5 bg-gray-900 border border-gray-800">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Requests</div>
                            <div className="text-sm font-mono text-white">{metrics.count.toLocaleString()}</div>
                          </div>
                          <div className="px-3 py-1.5 bg-gray-900 border border-gray-800">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Avg Time</div>
                            <div className="text-sm font-mono text-white">{metrics.avgTime}ms</div>
                          </div>
                          <div className="px-3 py-1.5 bg-gray-900 border border-gray-800">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Error Rate</div>
                            <div className={`text-sm font-mono ${metrics.errorRate > 5 ? 'text-red-400' : metrics.errorRate > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {metrics.errorRate.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}

                      {route.tags && route.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {route.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-xs text-gray-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-gray-500">
                        {getRelativeTime(route.lastSeen)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Dependencies Section */}
      {dependencies.length > 0 && (
        <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">
              Dependencies ({dependencies.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {dependencies.map((dep) => (
              <div key={dep.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-white">
                        {dep.packageName}
                      </span>
                      <span className="px-2 py-0.5 border border-gray-800 bg-gray-900 font-mono text-xs text-gray-400">
                        v{dep.version}
                      </span>
                      <span className="px-2 py-0.5 border border-gray-800 bg-gray-900 font-mono text-xs text-gray-400 uppercase">
                        {dep.dependencyType}
                      </span>
                    </div>
                    {dep.description && (
                      <div className="text-sm text-gray-500 mb-2">
                        {dep.description}
                      </div>
                    )}
                    {dep.license && (
                      <div className="font-mono text-xs text-gray-600">
                        License: {dep.license}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Links */}
      {(service.repository || service.healthCheckUrl) && (
        <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Links
          </h2>
          <div className="space-y-2">
            {service.repository && (
              <div>
                <span className="font-mono text-xs text-gray-500 uppercase tracking-wider mr-3">
                  Repository:
                </span>
                <a
                  href={service.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {service.repository}
                </a>
              </div>
            )}
            {service.healthCheckUrl && (
              <div>
                <span className="font-mono text-xs text-gray-500 uppercase tracking-wider mr-3">
                  Health Check:
                </span>
                <a
                  href={service.healthCheckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {service.healthCheckUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ServiceDetails id={params.id} />
    </Suspense>
  )
}
