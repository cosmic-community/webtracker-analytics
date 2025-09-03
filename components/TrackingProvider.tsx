'use client'

import { useEffect } from 'react'

interface TrackingProviderProps {
  children: React.ReactNode
}

export default function TrackingProvider({ children }: TrackingProviderProps) {
  useEffect(() => {
    // Additional client-side initialization if needed
    console.log('[WebTracker] Analytics provider loaded')
    
    // Optional: Set up any global event listeners or configurations
    const handleError = (error: ErrorEvent) => {
      console.error('[WebTracker] JavaScript error:', error)
    }
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[WebTracker] Unhandled promise rejection:', event.reason)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return <>{children}</>
}