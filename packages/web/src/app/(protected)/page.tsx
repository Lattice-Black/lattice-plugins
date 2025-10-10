import { Suspense } from 'react'
import Link from 'next/link'
import { ServiceCard } from '@/components/ServiceCard'
import { LoadingGrid } from '@/components/Loading'
import { fetchServices } from '@/lib/api'

async function ServiceGrid() {
  const data = await fetchServices({ limit: 50 })

  if (!data.services || data.services.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-24 h-24 border-2 border-gray-800 mb-6 mx-auto relative">
            <div className="absolute inset-4 border border-gray-800" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No Services Discovered
          </h2>
          <p className="text-sm text-gray-500 font-mono">
            Start your services with Lattice plugin to see them here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          routeCount={0}
          dependencyCount={0}
        />
      ))}
    </div>
  )
}

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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm">
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
            Total Services
          </div>
          <div className="text-3xl font-bold text-white">
            <Suspense fallback={<div className="animate-pulse">--</div>}>
              <ServiceCount />
            </Suspense>
          </div>
        </div>
        <div className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm">
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
            Active
          </div>
          <div className="text-3xl font-bold text-white">
            <Suspense fallback={<div className="animate-pulse">--</div>}>
              <ActiveCount />
            </Suspense>
          </div>
        </div>
        <div className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm">
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
            Frameworks
          </div>
          <div className="text-3xl font-bold text-white">
            <Suspense fallback={<div className="animate-pulse">--</div>}>
              <FrameworkCount />
            </Suspense>
          </div>
        </div>
        <div className="border border-gray-800 p-6 bg-black/50 backdrop-blur-sm">
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
            Environments
          </div>
          <div className="text-3xl font-bold text-white">
            <Suspense fallback={<div className="animate-pulse">--</div>}>
              <EnvironmentCount />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <Suspense fallback={<LoadingGrid />}>
        <ServiceGrid />
      </Suspense>
    </div>
  )
}

async function ServiceCount() {
  const data = await fetchServices({ limit: 1 })
  return <>{data.total}</>
}

async function ActiveCount() {
  const data = await fetchServices({ status: 'active', limit: 1 })
  return <>{data.total}</>
}

async function FrameworkCount() {
  const data = await fetchServices({ limit: 100 })
  const frameworks = new Set(data.services.map(s => s.framework))
  return <>{frameworks.size}</>
}

async function EnvironmentCount() {
  const data = await fetchServices({ limit: 100 })
  const environments = new Set(data.services.map(s => s.environment).filter(Boolean))
  return <>{environments.size}</>
}
