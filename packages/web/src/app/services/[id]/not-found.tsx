import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full border border-gray-800 bg-black/50 backdrop-blur-sm p-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 border-2 border-gray-700 mb-6 mx-auto relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl text-gray-600">404</div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Service Not Found
          </h2>
          <p className="text-sm text-gray-400 font-mono">
            The requested service could not be found in the system
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-gray-700 hover:border-gray-600 text-white hover:bg-gray-900 transition-colors font-mono text-sm uppercase tracking-wider"
        >
          Back to Services
        </Link>
      </div>
    </div>
  )
}
