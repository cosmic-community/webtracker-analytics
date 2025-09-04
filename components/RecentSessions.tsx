'use client'

import { useEffect, useState } from 'react'
import { Clock, MousePointer, Eye, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { TrackingSession } from '@/types'

export default function RecentSessions() {
  const [sessions, setSessions] = useState<TrackingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/sessions?limit=5')
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions || [])
        } else {
          setError('Failed to fetch recent sessions')
          setSessions([])
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
        setError('Network error while fetching sessions')
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
    
    // Refresh sessions every 30 seconds
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const sessionTime = new Date(timestamp)
    const diffMs = now.getTime() - sessionTime.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffMinutes < 1) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else {
      return `${diffHours}h ago`
    }
  }

  const getTopPage = (session: TrackingSession): string => {
    const pagesVisited = session.metadata?.pages_visited || ['/']
    return pagesVisited[0] || '/'
  }

  const formatPageTitle = (pageUrl: string): string => {
    switch (pageUrl) {
      case '/':
        return 'Homepage'
      case '/dashboard':
        return 'Dashboard'
      case '/sessions':
        return 'Sessions'
      case '/heatmaps':
        return 'Heatmaps'
      default:
        return pageUrl.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
    }
  }

  if (loading) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Sessions
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary rounded animate-pulse w-2/3"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-secondary rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-secondary rounded animate-pulse w-20"></div>
                  <div className="h-3 bg-secondary rounded animate-pulse w-12"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-secondary rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || sessions.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Sessions
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {error || 'No sessions found'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sessions will appear here as users visit your site
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-primary mt-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Currently tracking
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Sessions
        </div>
        <Link 
          href="/sessions"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all →
        </Link>
      </h3>
      
      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="group border border-border rounded-lg p-3 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">
                    {formatPageTitle(getTopPage(session))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(session.created_at)}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(session.metadata?.duration || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {session.metadata?.page_views || 0} views
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3" />
                    {session.metadata?.total_clicks || 0} clicks
                  </div>
                </div>
              </div>
              
              <Link 
                href={`/sessions/${session.id}`}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}