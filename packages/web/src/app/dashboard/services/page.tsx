import { ServicesList } from '@/components/services-list'

// Force dynamic rendering - authentication required
export const dynamic = 'force-dynamic'

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Services
          </h1>
          <p className="text-gray-500 font-mono text-sm">
            All discovered services and their metadata
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <ServicesList />
    </div>
  )
}
