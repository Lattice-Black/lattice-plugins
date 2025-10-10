'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ErrorState'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Service detail error:', error)
  }, [error])

  return <ErrorState error={error} reset={reset} />
}
