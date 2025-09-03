'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, FastForward, Rewind, MousePointer, Eye, Clock } from 'lucide-react'
import type { TrackingSession, TrackingEvent } from '@/types'

interface SessionPlayerProps {
  session: TrackingSession
}

export default function SessionPlayer({ session }: SessionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [currentEvent, setCurrentEvent] = useState<TrackingEvent | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 1920, height: 1080 })
  
  const playerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()
  const timelineRef = useRef<HTMLDivElement>(null)

  // Get events and duration
  const events = Array.isArray(session.metadata.events) ? session.metadata.events : []
  const duration = session.metadata.duration || 0
  const totalEvents = events.length

  // Get scroll events for timeline visualization
  const scrollEvents = events.filter(e => e.type === 'scroll')
  const clickEvents = events.filter(e => e.type === 'click')
  const mouseMoveEvents = events.filter(e => e.type === 'mousemove')

  useEffect(() => {
    if (isPlaying && duration > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + (100 * playbackSpeed)
          if (newTime >= duration) {
            setIsPlaying(false)
            return duration
          }
          return newTime
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, duration])

  // Update current event and cursor position based on timeline
  useEffect(() => {
    const startTime = new Date(session.metadata.started_at).getTime()
    const targetTime = startTime + currentTime

    // Find the most recent event at or before current time
    let relevantEvent: TrackingEvent | null = null
    
    for (const event of events) {
      if (event.timestamp <= targetTime) {
        relevantEvent = event
      } else {
        break
      }
    }

    if (relevantEvent && relevantEvent !== currentEvent) {
      setCurrentEvent(relevantEvent)
      
      // Update cursor position for mouse events
      if ((relevantEvent.type === 'mousemove' || relevantEvent.type === 'click') && 
          relevantEvent.x !== undefined && relevantEvent.y !== undefined) {
        setCursorPosition({ x: relevantEvent.x, y: relevantEvent.y })
      }

      // Update viewport size for resize events
      if (relevantEvent.type === 'resize' || (relevantEvent.windowWidth && relevantEvent.windowHeight)) {
        setViewportSize({
          width: relevantEvent.windowWidth || 1920,
          height: relevantEvent.windowHeight || 1080
        })
      }
    }
  }, [currentTime, events, session.metadata.started_at, currentEvent])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setCurrentTime(0)
    setIsPlaying(false)
    setCursorPosition({ x: 0, y: 0 })
    setCurrentEvent(null)
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
  }

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current && duration > 0) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * duration
      setCurrentTime(Math.max(0, Math.min(newTime, duration)))
    }
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  // Calculate scroll percentage safely
  const getScrollPercentage = (): number => {
    const lastScroll = scrollEvents[scrollEvents.length - 1]
    if (!lastScroll || lastScroll.scrollTop === undefined || lastScroll.pageHeight === undefined) {
      return 0
    }
    
    const scrollTop = lastScroll.scrollTop
    const pageHeight = lastScroll.pageHeight
    const windowHeight = lastScroll.windowHeight || 1080
    
    if (pageHeight <= windowHeight) return 0
    return Math.min(100, Math.max(0, (scrollTop / (pageHeight - windowHeight)) * 100))
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Player Header */}
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Session Recording</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(duration)}
              </span>
              <span className="flex items-center gap-1">
                <MousePointer className="w-3 h-3" />
                {totalEvents} events
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {session.metadata.pages_visited?.length || 0} pages
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Session ID: {session.metadata.session_id}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(session.metadata.started_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Player Viewport */}
      <div 
        ref={playerRef}
        className="relative bg-white overflow-hidden"
        style={{ 
          height: '400px',
          aspectRatio: `${viewportSize.width} / ${viewportSize.height}`
        }}
      >
        {/* Simulated webpage content */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <header className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">Sample Website</h1>
              <p className="text-gray-600">Recorded user session playback</p>
              <div className="flex gap-3 justify-center">
                <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                  Button 1
                </div>
                <div className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                  Button 2
                </div>
              </div>
            </header>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="font-medium mb-2">Feature 1</h3>
                <p className="text-sm text-gray-600">Content area 1</p>
              </div>
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="font-medium mb-2">Feature 2</h3>
                <p className="text-sm text-gray-600">Content area 2</p>
              </div>
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="font-medium mb-2">Feature 3</h3>
                <p className="text-sm text-gray-600">Content area 3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mouse cursor */}
        {currentEvent && (currentEvent.type === 'mousemove' || currentEvent.type === 'click') && (
          <div
            className="absolute pointer-events-none transition-all duration-100 ease-linear z-50"
            style={{
              left: `${(cursorPosition.x / viewportSize.width) * 100}%`,
              top: `${(cursorPosition.y / viewportSize.height) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {currentEvent.type === 'click' ? (
              <div className="relative">
                <MousePointer className="w-5 h-5 text-blue-500 drop-shadow-lg" />
                <div className="absolute -top-1 -left-1 w-7 h-7 border-2 border-red-500 rounded-full animate-ping" />
              </div>
            ) : (
              <MousePointer className="w-5 h-5 text-blue-500 drop-shadow-lg" />
            )}
          </div>
        )}

        {/* Scroll indicator */}
        {scrollEvents.length > 0 && (
          <div className="absolute right-2 top-2 bottom-2 w-2 bg-gray-200 rounded">
            <div 
              className="w-full bg-blue-500 rounded transition-all duration-200"
              style={{ height: `${getScrollPercentage()}%` }}
            />
          </div>
        )}

        {/* Event indicator */}
        {currentEvent && (
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {currentEvent.type} - {new Date(currentEvent.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4 border-t border-border">
        <div className="space-y-3">
          {/* Progress bar */}
          <div 
            ref={timelineRef}
            className="relative h-2 bg-muted rounded cursor-pointer"
            onClick={handleTimelineClick}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded transition-all duration-100"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
            
            {/* Event markers */}
            {events.map((event, index) => {
              const startTime = new Date(session.metadata.started_at).getTime()
              const eventTime = event.timestamp - startTime
              const position = duration > 0 ? (eventTime / duration) * 100 : 0
              
              let markerColor = 'bg-gray-400'
              if (event.type === 'click') markerColor = 'bg-red-500'
              else if (event.type === 'scroll') markerColor = 'bg-blue-500'
              else if (event.type === 'mousemove') markerColor = 'bg-green-500'
              
              return (
                <div
                  key={`${event.id}-${index}`}
                  className={`absolute top-0 w-1 h-full ${markerColor} opacity-60`}
                  style={{ left: `${Math.min(98, Math.max(0, position))}%` }}
                />
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 5000))}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Rewind 5s"
              >
                <Rewind className="w-4 h-4" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-2 hover:bg-muted rounded transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 5000))}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Fast forward 5s"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Speed control */}
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Speed:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="bg-background border border-border rounded px-2 py-1 text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>

              {/* Time display */}
              <div className="text-sm text-muted-foreground font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Clicks</div>
            <div className="font-semibold text-red-500">
              {clickEvents.length}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Mouse Moves</div>
            <div className="font-semibold text-green-500">
              {mouseMoveEvents.length}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Scrolls</div>
            <div className="font-semibold text-blue-500">
              {scrollEvents.length}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Max Scroll</div>
            <div className="font-semibold text-purple-500">
              {getScrollPercentage().toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}