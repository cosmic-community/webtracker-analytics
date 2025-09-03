'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Clock, MousePointer, Eye, User, Calendar } from 'lucide-react'
import type { TrackingSession } from '@/types'

interface SessionsListProps {
  limit?: number
}

export default function SessionsList({ limit }: SessionsListProps) {
  const [sessions, setSessions] = useState<TrackingSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/sessions${limit ? `?limit=${limit}` : ''}`)
        if (response.ok) {
          const data = await response.json()
          setSessions(Array.isArray(data.sessions) ? data.sessions : [])
        } else {
          console.error('Failed to fetch sessions:', response.status, response.statusText)
          setSessions([])
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [limit])

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const getSessionStatus = (session: TrackingSession): { status: string; color: string } => {
    if (session.metadata.ended_at) {
      return { status: 'Completed', color: 'text-green-500' }
    }
    
    const startTime = new Date(session.metadata.started_at).getTime()
    const now = Date.now()
    const timeSinceStart = now - startTime
    
    // Consider session active if started within last 30 minutes and no end time
    if (timeSinceStart < 30 * 60 * 1000) {
      return { status: 'Live', color: 'text-blue-500' }
    }
    
    return { status: 'Abandoned', color: 'text-yellow-500' }
  }

  const getBrowserInfo = (userAgent: string): { browser: string; os: string } => {
    const ua = userAgent.toLowerCase()
    
    let browser = 'Unknown'
    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'
    else if (ua.includes('edge')) browser = 'Edge'
    
    let os = 'Unknown'
    if (ua.includes('windows')) os = 'Windows'
    else if (ua.includes('mac')) os = 'macOS'
    else if (ua.includes('linux')) os = 'Linux'
    else if (ua.includes('ios')) os = 'iOS'
    else if (ua.includes('android')) os = 'Android'
    
    return { browser, os }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 5)].map((_, i) => (
          <div key={i} className="stat-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-secondary rounded loading-shimmer w-48"></div>
                  <div className="h-3 bg-secondary rounded loading-shimmer w-32"></div>
                </div>
                <div className="h-8 w-16 bg-secondary rounded loading-shimmer"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-secondary rounded loading-shimmer w-24"></div>
                <div className="h-3 bg-secondary rounded loading-shimmer w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No Sessions Recorded</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Session recordings will appear here as users interact with your website. 
              Continue browsing to generate session data.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-primary">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Currently tracking user sessions
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const sessionStatus = getSessionStatus(session)
        const { browser, os } = getBrowserInfo(session.metadata.user_agent || '')
        const hasEvents = Array.isArray(session.metadata.events) && session.metadata.events.length > 0

        return (
          <div key={session.id} className="stat-card group hover:border-primary/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      Session {session.metadata.session_id?.slice(-8) || session.id.slice(-8)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.metadata.started_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-500 font-medium">
                      {formatDuration(session.metadata.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 font-medium">
                      {session.metadata.page_views} pages
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3 text-red-500" />
                    <span className="text-red-500 font-medium">
                      {session.metadata.total_clicks} clicks
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className={`text-sm font-medium ${sessionStatus.color}`}>
                  {sessionStatus.status}
                </div>
                {hasEvents && (
                  <Link 
                    href={`/sessions/${session.id}`}
                    className="btn-primary inline-flex items-center gap-2 text-sm px-3 py-1"
                  >
                    <Play className="w-3 h-3" />
                    Watch
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{browser} • {os}</span>
                  <span>{session.metadata.website_domain}</span>
                  <span>
                    {Array.isArray(session.metadata.events) ? session.metadata.events.length : 0} events
                  </span>
                </div>
                
                {Array.isArray(session.metadata.pages_visited) && session.metadata.pages_visited.length > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">Pages:</span>
                    {session.metadata.pages_visited.slice(0, 3).map((page, index) => (
                      <span key={index} className="bg-muted px-2 py-1 rounded text-xs">
                        {page}
                      </span>
                    ))}
                    {session.metadata.pages_visited.length > 3 && (
                      <span className="text-muted-foreground">
                        +{session.metadata.pages_visited.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!hasEvents && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <div className="w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">!</span>
                  </div>
                  No recorded events - playback not available
                </div>
              </div>
            )}
          </div>
        )
      })}
      
      {limit && sessions.length >= limit && (
        <div className="text-center py-4">
          <Link 
            href="/sessions" 
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
          >
            View all sessions →
          </Link>
        </div>
      )}
    </div>
  )
}