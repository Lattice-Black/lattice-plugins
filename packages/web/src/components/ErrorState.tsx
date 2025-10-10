interface ErrorStateProps {
  error: Error
  reset?: () => void
}

export function ErrorState({ error, reset }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full border border-gray-800 bg-black/50 backdrop-blur-sm p-8">
        <div className="mb-6">
          <div className="w-16 h-16 border-2 border-gray-700 mb-4 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-3xl text-gray-600">!</div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-sm text-gray-400 font-mono">
            {error.message}
          </p>
        </div>
        {reset && (
          <button
            onClick={reset}
            className="w-full px-4 py-2 border border-gray-700 hover:border-gray-600 text-white hover:bg-gray-900 transition-colors font-mono text-sm uppercase tracking-wider"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
