export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-gray-800 animate-ping" />
        <div className="absolute inset-2 border border-gray-700" />
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="p-6 animate-pulse">
        <div className="h-6 bg-gray-800 mb-4 w-3/4" />
        <div className="h-4 bg-gray-900 mb-2 w-full" />
        <div className="h-4 bg-gray-900 mb-4 w-2/3" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-gray-900" />
          <div className="h-6 w-20 bg-gray-900" />
        </div>
        <div className="h-24 bg-gray-900 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-12 bg-gray-900" />
          <div className="h-12 bg-gray-900" />
          <div className="h-12 bg-gray-900" />
        </div>
      </div>
    </div>
  )
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}
