import Link from 'next/link'
import { Service } from '@/types'
import { getRelativeTime } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
  routeCount?: number
  dependencyCount?: number
}

export function ServiceCard({ service, routeCount = 0, dependencyCount = 0 }: ServiceCardProps) {
  const statusColor = {
    active: 'text-white',
    inactive: 'text-gray-500',
    unknown: 'text-gray-600',
  }[service.status]

  return (
    <Link href={`/services/${service.id}`}>
      <div className="group border border-gray-800 hover:border-gray-600 transition-all duration-200 bg-black/50 backdrop-blur-sm">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-gray-300 transition-colors">
                {service.name}
              </h3>
              {service.version && (
                <div className="font-mono text-xs text-gray-500">
                  v{service.version}
                </div>
              )}
            </div>
            <div className={`font-mono text-xs uppercase tracking-wider ${statusColor}`}>
              {service.status}
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {service.description}
            </p>
          )}

          {/* Tech Stack */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                {service.framework}
              </span>
              <span className="px-2 py-1 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                {service.language}
              </span>
              {service.environment && (
                <span className="px-2 py-1 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                  {service.environment}
                </span>
              )}
            </div>
          </div>

          {/* Wireframe Icon */}
          <div className="mb-4 flex items-center justify-center py-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-2 border-gray-700" />
              <div className="absolute inset-2 border border-gray-800" />
              <div className="absolute inset-4 border border-gray-800" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-700" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                Routes
              </div>
              <div className="text-lg font-semibold text-white">
                {routeCount}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                Dependencies
              </div>
              <div className="text-lg font-semibold text-white">
                {dependencyCount}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                Last Seen
              </div>
              <div className="text-xs font-mono text-gray-400">
                {getRelativeTime(service.lastSeen)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
