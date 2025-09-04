'use client'

import { useEffect, useState } from 'react'
import { Activity, MousePointer, Eye, Scroll, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
  sessionId?: string
  pageUrl?: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/stats?timeRange=1d')
        if (response.ok) {
          const data = await response.json()
          setActivities(data.recentActivity || [])
        } else {
          setError('Failed to fetch recent activity')
          setActivities([])
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error)
        setError('Network error while fetching activity')
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    
    // Refresh activities every 15 seconds for live updates
    const interval = setInterval(fetchActivities, 15000)
    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (description: string) => {
    if (description.includes('click')) {
      return <MousePointer className="w-4 h-4 text-red-500" />
    } else if (description.includes('scroll')) {
      return <Scroll className="w-4 h-4 text-blue-500" />
    } else if (description.includes('pageview')) {
      return <Eye className="w-4 h-4 text-green-500" />
    } else {
      return <Activity className="w-4 h-4 text-purple-500" />
    }
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffMs = now.getTime() - activityTime.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  const formatPageTitle = (pageUrl: string): string => {
    switch (pageUrl) {
      case '/':
        return 'Homepage'
      case '/dashboard':
        return 'Dashboard'
      case '/sessions':
        return 'Sessions Page'
      case '/heatmaps':
        return 'Heatmaps Page'
      default:
        return pageUrl.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
    }
  }

  if (loading) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-secondary rounded animate-pulse w-1/2"></div>
              </div>
              <div className="w-12 h-3 bg-secondary rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || activities.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {error || 'No recent activity found'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Activity will appear here as users interact with your site
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-primary mt-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Tracking active
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Recent Activity
        <div className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          Live
        </div>
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 group">
            <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center flex-shrink-0">
              {getActivityIcon(activity.description)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                {activity.description.includes('New') 
                  ? activity.description.replace(activity.pageUrl || '', formatPageTitle(activity.pageUrl || '/'))
                  : activity.description
                }
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.timestamp)}
                </p>
                {activity.sessionId && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Link 
                      href={`/sessions/${activity.sessionId}`}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      View session
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex-shrink-0">
              {formatTimeAgo(activity.timestamp)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <Link 
          href="/sessions" 
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
        >
          View all sessions →
        </Link>
      </div>
    </div>
  )
}