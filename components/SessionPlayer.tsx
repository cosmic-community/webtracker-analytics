'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Square } from 'lucide-react'
import type { TrackingSession, TrackingEvent } from '@/types'

interface SessionPlayerProps {
  session: TrackingSession
}

export default function SessionPlayer({ session }: SessionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  const events = Array.isArray(session.metadata.events) ? session.metadata.events : []
  const sessionDuration = session.metadata.duration || (events.length > 0 ? Math.max(...events.map(e => e.timestamp)) - Math.min(...events.map(e => e.timestamp)) : 0)
  
  // Normalize event timestamps to start from 0
  const normalizeTimestamp = useCallback((timestamp: number): number => {
    if (events.length === 0) return 0
    const firstTimestamp = Math.min(...events.map(e => e.timestamp))
    return timestamp - firstTimestamp
  }, [events])

  const getCurrentEvents = useCallback((time: number): TrackingEvent[] => {
    if (events.length === 0) return []
    
    return events.filter(event => {
      const normalizedTime = normalizeTimestamp(event.timestamp)
      return normalizedTime <= time
    })
  }, [events, normalizeTimestamp])

  const drawCanvas = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 1200
    canvas.height = 800

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw webpage mockup background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvas.width, 80) // Header
    ctx.fillStyle = '#e9ecef'
    ctx.fillRect(0, 80, canvas.width, 2) // Border

    // Draw content areas
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(50, 120, canvas.width - 100, 200) // Main content
    ctx.fillStyle = '#e9ecef'
    ctx.strokeRect(50, 120, canvas.width - 100, 200)

    // Draw sidebar
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(50, 340, 300, canvas.height - 380)
    ctx.fillStyle = '#e9ecef'
    ctx.strokeRect(50, 340, 300, canvas.height - 380)

    // Get events up to current time
    const currentEvents = getCurrentEvents(time)
    
    // Draw mouse trail
    const mouseEvents = currentEvents
      .filter(e => e.type === 'mousemove' && e.x !== undefined && e.y !== undefined)
      .slice(-10) // Show last 10 mouse positions for trail effect

    if (mouseEvents.length > 1) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      mouseEvents.forEach((event, index) => {
        const x = (event.x! / 1920) * canvas.width // Scale to canvas
        const y = (event.y! / 1080) * canvas.height
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
    }

    // Draw current mouse position
    const lastMouseEvent = mouseEvents[mouseEvents.length - 1]
    if (lastMouseEvent && lastMouseEvent.x !== undefined && lastMouseEvent.y !== undefined) {
      const x = (lastMouseEvent.x / 1920) * canvas.width
      const y = (lastMouseEvent.y / 1080) * canvas.height
      
      // Mouse cursor
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
      
      // Cursor pointer shape
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(x - 3, y - 3)
      ctx.lineTo(x + 3, y)
      ctx.lineTo(x, y + 3)
      ctx.fill()
    }

    // Draw click events
    const clickEvents = currentEvents.filter(e => e.type === 'click' && e.x !== undefined && e.y !== undefined)
    clickEvents.forEach((event, index) => {
      if (event.x === undefined || event.y === undefined) return
      
      const x = (event.x / 1920) * canvas.width
      const y = (event.y / 1080) * canvas.height
      const eventTime = normalizeTimestamp(event.timestamp)
      const timeSinceClick = time - eventTime
      
      if (timeSinceClick < 1000) { // Show click animation for 1 second
        const progress = timeSinceClick / 1000
        const radius = 20 * (1 - progress)
        const opacity = 1 - progress
        
        // Click ripple effect
        ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.stroke()
        
        // Click dot
        ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw scroll indicator
    const scrollEvents = currentEvents.filter(e => e.type === 'scroll')
    if (scrollEvents.length > 0) {
      const lastScroll = scrollEvents[scrollEvents.length - 1]
      if (lastScroll.scrollTop !== undefined && lastScroll.pageHeight !== undefined) {
        const scrollPercent = (lastScroll.scrollTop / lastScroll.pageHeight) * 100
        const scrollY = Math.min(scrollPercent / 100 * (canvas.height - 100), canvas.height - 100)
        
        // Scroll indicator
        ctx.fillStyle = '#10b981'
        ctx.fillRect(canvas.width - 20, scrollY, 10, 20)
        
        // Scroll percentage text
        ctx.fillStyle = '#374151'
        ctx.font = '12px monospace'
        ctx.fillText(`${Math.round(scrollPercent)}%`, canvas.width - 60, scrollY + 15)
      }
    }

    // Draw timestamp
    ctx.fillStyle = '#374151'
    ctx.font = '14px monospace'
    ctx.fillText(`${formatTime(time)} / ${formatTime(sessionDuration)}`, 20, 30)
    
    // Draw current event info
    const recentEvent = currentEvents[currentEvents.length - 1]
    if (recentEvent) {
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px sans-serif'
      ctx.fillText(`Last action: ${recentEvent.type}`, 20, 50)
    }
  }, [getCurrentEvents, normalizeTimestamp, sessionDuration])

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const animate = useCallback(() => {
    if (!isPlaying) return

    const now = Date.now()
    const elapsed = (now - startTimeRef.current + pausedTimeRef.current) * playbackSpeed
    const newTime = Math.min(elapsed, sessionDuration)
    
    setCurrentTime(newTime)
    drawCanvas(newTime)
    
    if (newTime < sessionDuration) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setIsPlaying(false)
    }
  }, [isPlaying, playbackSpeed, sessionDuration, drawCanvas])

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now()
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      pausedTimeRef.current = currentTime
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, animate, currentTime])

  useEffect(() => {
    drawCanvas(currentTime)
  }, [currentTime, drawCanvas])

  const handlePlay = () => {
    if (currentTime >= sessionDuration) {
      setCurrentTime(0)
      pausedTimeRef.current = 0
    }
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setCurrentTime(0)
    pausedTimeRef.current = 0
    setIsPlaying(false)
    drawCanvas(0)
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * sessionDuration
    
    setCurrentTime(newTime)
    pausedTimeRef.current = newTime
    drawCanvas(newTime)
  }

  const handleSkip = (direction: 'forward' | 'back') => {
    const skipAmount = 5000 // 5 seconds
    const newTime = direction === 'forward' 
      ? Math.min(currentTime + skipAmount, sessionDuration)
      : Math.max(currentTime - skipAmount, 0)
    
    setCurrentTime(newTime)
    pausedTimeRef.current = newTime
    drawCanvas(newTime)
  }

  if (events.length === 0) {
    return (
      <div className="bg-muted/20 rounded-lg p-8 min-h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">No Recording Data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This session doesn't contain any recorded events to playback.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Player Canvas */}
      <div className="relative bg-white border border-border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[500px]"
          style={{ aspectRatio: '1200/800' }}
        />
        
        {/* Play overlay (shown when not playing) */}
        {!isPlaying && currentTime === 0 && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Play className="w-8 h-8 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
        {/* Timeline */}
        <div className="space-y-2">
          <div
            ref={timelineRef}
            className="relative h-2 bg-muted rounded-full cursor-pointer"
            onClick={handleTimelineClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${sessionDuration > 0 ? (currentTime / sessionDuration) * 100 : 0}%` }}
            />
            
            {/* Event markers */}
            {events.map((event, index) => {
              const normalizedTime = normalizeTimestamp(event.timestamp)
              const position = sessionDuration > 0 ? (normalizedTime / sessionDuration) * 100 : 0
              
              return (
                <div
                  key={event.id || index}
                  className="absolute top-0 w-1 h-full transform -translate-x-0.5"
                  style={{ left: `${position}%` }}
                >
                  <div className={`w-full h-full ${
                    event.type === 'click' ? 'bg-red-400' :
                    event.type === 'scroll' ? 'bg-blue-400' :
                    event.type === 'mousemove' ? 'bg-green-400' :
                    'bg-gray-400'
                  }`} />
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(sessionDuration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="btn-secondary inline-flex items-center gap-2 px-3 py-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </button>
            
            <button
              onClick={() => handleSkip('back')}
              className="btn-secondary p-2"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={handlePlay}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={() => handleSkip('forward')}
              className="btn-secondary p-2"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-background border border-border rounded px-2 py-1 text-sm"
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {events.length} events
            </div>
          </div>
        </div>
      </div>

      {/* Event Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span>Clicks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span>Scrolls</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>Mouse Movement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Mouse Position</span>
        </div>
      </div>
    </div>
  )
}