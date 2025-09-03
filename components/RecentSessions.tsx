'use client'

import { useEffect, useState } from 'react'
import { Play, Calendar, Clock, MousePointer, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { TrackingSession } from '@/types'

interface RecentSessionsProps {
  limit?: number
}

export default function RecentSessions({ limit = 10 }: RecentSessionsProps) {
  const [sessions, setSessions] = useState<TrackingSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/sessions?limit=${limit}`)
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
  }, [limit])

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 bg-secondary rounded loading-shimmer"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded loading-shimmer w-32"></div>
                  <div className="h-3 bg-secondary rounded loading-shimmer w-48"></div>
                </div>
              </div>
              <div className="h-8 bg-secondary rounded loading-shimmer w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Sessions will appear here as users interact with your website. 
          The current page is being tracked, so refresh in a few minutes to see data.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-primary">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Currently tracking your session
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div 
          key={session.id} 
          className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Play className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Session {session.metadata?.session_id?.split('_')[1] || session.id.slice(-6)}
                  </h3>
                  <span className="text-xs bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {getSessionSummary(session)} • {formatDuration(session.metadata?.duration || 0)}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3" />
                    {(session.metadata?.events?.length || 0).toLocaleString()} events
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm font-medium">
                {formatDuration(session.metadata?.duration || 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Duration
              </div>
            </div>
          </div>
          
          {/* Session preview bar */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  Started: {new Date(session.created_at).toLocaleTimeString()}
                </span>
                {session.metadata?.pages_visited && session.metadata.pages_visited.length > 0 && (
                  <span className="text-muted-foreground">
                    Pages: {session.metadata.pages_visited.join(', ')}
                  </span>
                )}
              </div>
              <button className="text-primary hover:text-primary/80 font-medium">
                View Replay →
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {sessions.length >= limit && (
        <div className="text-center pt-4">
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            View All Sessions →
          </button>
        </div>
      )}
    </div>
  )
}