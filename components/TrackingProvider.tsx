'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { TrackingEvent } from '@/types'

interface TrackingContextType {
  isTracking: boolean
  sessionId: string | null
  addEvent: (event: TrackingEvent) => void
  getEvents: () => TrackingEvent[]
}

const TrackingContext = createContext<TrackingContextType>({
  isTracking: false,
  sessionId: null,
  addEvent: () => {},
  getEvents: () => []
})

export function useTracking() {
  return useContext(TrackingContext)
}

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [isTracking, setIsTracking] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)

  useEffect(() => {
    // Initialize tracking
    const initializeTracking = async () => {
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)
      setSessionStartTime(Date.now())
      setIsTracking(true)

      // Create session in Cosmic
      try {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create',
            session_id: newSessionId,
            website_domain: window.location.hostname,
            user_agent: navigator.userAgent
          })
        })
      } catch (error) {
        console.error('Failed to create session:', error)
      }

      // Add initial page view event
      addEvent({
        id: generateEventId(),
        type: 'pageview',
        timestamp: Date.now(),
        url: window.location.href,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      })
    }

    initializeTracking()

    // Track mouse movements
    let lastMouseUpdate = 0
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      // Throttle mouse events to every 100ms
      if (now - lastMouseUpdate > 100) {
        addEvent({
          id: generateEventId(),
          type: 'mousemove',
          x: e.clientX,
          y: e.clientY,
          timestamp: now,
          url: window.location.href
        })
        lastMouseUpdate = now
      }
    }

    // Track clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      addEvent({
        id: generateEventId(),
        type: 'click',
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        url: window.location.href,
        element: target.tagName.toLowerCase()
      })
    }

    // Track scrolling
    let lastScrollUpdate = 0
    const handleScroll = () => {
      const now = Date.now()
      // Throttle scroll events to every 200ms
      if (now - lastScrollUpdate > 200) {
        addEvent({
          id: generateEventId(),
          type: 'scroll',
          scrollTop: window.scrollY,
          scrollLeft: window.scrollX,
          timestamp: now,
          url: window.location.href,
          pageHeight: document.documentElement.scrollHeight,
          windowHeight: window.innerHeight
        })
        lastScrollUpdate = now
      }
    }

    // Track window resize
    const handleResize = () => {
      addEvent({
        id: generateEventId(),
        type: 'resize',
        timestamp: Date.now(),
        url: window.location.href,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      })
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('click', handleClick, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    // Save session data periodically
    const saveInterval = setInterval(() => {
      if (events.length > 0 && sessionId) {
        saveSessionData()
      }
    }, 10000) // Save every 10 seconds

    // Save on page unload
    const handleBeforeUnload = () => {
      if (events.length > 0 && sessionId) {
        saveSessionData(true) // Mark as ended
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(saveInterval)
    }
  }, [])

  const addEvent = (event: TrackingEvent) => {
    setEvents(prev => [...prev, event])
  }

  const getEvents = () => events

  const saveSessionData = async (isEnding = false) => {
    if (!sessionId || events.length === 0) return

    try {
      const pages = [...new Set(events.map(e => new URL(e.url).pathname))]
      const clickCount = events.filter(e => e.type === 'click').length
      const scrollCount = events.filter(e => e.type === 'scroll').length
      const duration = Date.now() - sessionStartTime

      await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          session_id: sessionId,
          events: events,
          duration: duration,
          page_views: pages.length,
          total_clicks: clickCount,
          total_scrolls: scrollCount,
          pages_visited: pages,
          ended_at: isEnding ? new Date().toISOString() : undefined
        })
      })

      // Also update heatmap data
      await fetch('/api/heatmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website_domain: window.location.hostname,
          page_url: window.location.pathname,
          events: events
        })
      })

      // Clear events after successful save
      if (!isEnding) {
        setEvents([])
      }
    } catch (error) {
      console.error('Failed to save session data:', error)
    }
  }

  return (
    <TrackingContext.Provider value={{
      isTracking,
      sessionId,
      addEvent,
      getEvents
    }}>
      {children}
    </TrackingContext.Provider>
  )
}

function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

function generateEventId(): string {
  return 'event_' + Math.random().toString(36).substr(2, 9)
}