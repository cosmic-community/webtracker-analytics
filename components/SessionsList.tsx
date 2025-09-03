'use client'

import { useEffect, useState } from 'react'
import { Play, Calendar, Clock, MousePointer, Eye, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { TrackingSession } from '@/types'

export default function SessionsList() {
  const [sessions, setSessions] = useState<TrackingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions?limit=50')
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions || [])
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getSessionSummary = (session: TrackingSession): string => {
    const pages = session.metadata?.pages_visited?.length || 1
    const clicks = session.metadata?.total_clicks || 0
    return `${pages} page${pages !== 1 ? 's' : ''}, ${clicks} click${clicks !== 1 ? 's' : ''}`
  }

  const handleSessionClick = (sessionId: string) => {
    setSelectedSession(sessionId)
    // In a real implementation, this would open the session replay
    alert(`Opening session replay for ${sessionId}\n\nThis would show the full session playback with cursor movements, clicks, and scrolls.`)
  }

  if (loading) {
    return (
      <div className="space-y-1">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-8 w-8 bg-secondary rounded loading-shimmer"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-secondary rounded loading-shimmer w-48"></div>
                  <div className="h-3 bg-secondary rounded loading-shimmer w-64"></div>
                </div>
              </div>
              <div className="h-6 bg-secondary rounded loading-shimmer w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          No session recordings are available yet. Sessions will appear here as users 
          interact with your website. Your current session is being recorded!
        </p>
        <div className="inline-flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500">Currently tracking your session</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Sessions Table Header */}
      <div className="p-4 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-muted-foreground">
            <div className="col-span-1">
              <Play className="w-4 h-4" />
            </div>
            <div className="col-span-3">Session</div>
            <div className="col-span-2">Started</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2">Activity</div>
            <div className="col-span-2">Pages</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="divide-y divide-border">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={`p-4 hover:bg-muted/20 transition-colors cursor-pointer ${
              selectedSession === session.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
            }`}
            onClick={() => handleSessionClick(session.id)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Play Button */}
              <div className="col-span-1">
                <div className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                  <Play className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Session Info */}
              <div className="col-span-3">
                <div className="font-medium text-sm">
                  Session {session.metadata?.session_id?.split('_')[1] || session.id.slice(-6)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(session.metadata?.events?.length || 0).toLocaleString()} events recorded
                </div>
              </div>

              {/* Start Time */}
              <div className="col-span-2">
                <div className="text-sm">
                  {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(session.created_at).toLocaleTimeString()}
                </div>
              </div>

              {/* Duration */}
              <div className="col-span-2">
                <div className="text-sm font-medium">
                  {formatDuration(session.metadata?.duration || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.metadata?.ended_at ? 'Completed' : 'Active'}
                </div>
              </div>

              {/* Activity Stats */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3 text-blue-500" />
                    {session.metadata?.total_clicks || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    {session.metadata?.total_scrolls || 0}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  clicks • scrolls
                </div>
              </div>

              {/* Pages Visited */}
              <div className="col-span-2">
                <div className="text-sm">
                  {session.metadata?.pages_visited?.length || 1} pages
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {session.metadata?.pages_visited?.[0] || '/'}
                </div>
              </div>
            </div>

            {/* Expanded Session Details */}
            {selectedSession === session.id && (
              <div className="mt-4 pt-4 border-t border-border bg-muted/10 -mx-4 px-4 pb-2">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Session Details</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <div>User Agent: {session.metadata?.user_agent?.slice(0, 50)}...</div>
                      <div>Domain: {session.metadata?.website_domain}</div>
                      <div>Total Events: {session.metadata?.events?.length || 0}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Pages Visited</h4>
                    <div className="space-y-1">
                      {session.metadata?.pages_visited?.map((page, index) => (
                        <div key={index} className="text-muted-foreground text-xs">
                          {index + 1}. {page}
                        </div>
                      )) || <div className="text-muted-foreground text-xs">No page data</div>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn-primary text-xs px-3 py-1">
                    Watch Replay
                  </button>
                  <button className="btn-secondary text-xs px-3 py-1">
                    View Details
                  </button>
                  <button className="btn-secondary text-xs px-3 py-1">
                    Export Data
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="p-6 text-center border-t border-border">
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          Load More Sessions
        </button>
      </div>
    </div>
  )
}