'use client'

import { useEffect, useState } from 'react'
import { Activity, MousePointer, Eye, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  type: 'session_start' | 'session_end' | 'page_view' | 'click_cluster' | 'heatmap_update'
  description: string
  timestamp: string
  metadata?: {
    page?: string
    duration?: number
    clicks?: number
  }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Simulate recent activity data
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'session_start',
            description: 'New session started',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            metadata: { page: '/' }
          },
          {
            id: '2', 
            type: 'click_cluster',
            description: 'High click activity detected on homepage',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            metadata: { page: '/', clicks: 12 }
          },
          {
            id: '3',
            type: 'page_view',
            description: 'Dashboard page accessed',
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            metadata: { page: '/dashboard' }
          },
          {
            id: '4',
            type: 'heatmap_update',
            description: 'Heatmap data updated for sessions page',
            timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
            metadata: { page: '/sessions' }
          },
          {
            id: '5',
            type: 'session_end',
            description: 'Session completed',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            metadata: { duration: 180000, clicks: 8 }
          },
          {
            id: '6',
            type: 'session_start', 
            description: 'New session started',
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            metadata: { page: '/' }
          }
        ]

        setActivities(mockActivities)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'page_view' : 'click_cluster',
        description: Math.random() > 0.5 ? 'Page view recorded' : 'User interaction detected',
        timestamp: new Date().toISOString(),
        metadata: { 
          page: ['/', '/dashboard', '/sessions', '/heatmaps'][Math.floor(Math.random() * 4)],
          clicks: Math.floor(Math.random() * 10) + 1
        }
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep only 10 items
    }, 30000) // Add new activity every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'session_start':
        return <User className="w-4 h-4 text-green-500" />
      case 'session_end':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'page_view':
        return <Eye className="w-4 h-4 text-purple-500" />
      case 'click_cluster':
        return <MousePointer className="w-4 h-4 text-red-500" />
      case 'heatmap_update':
        return <Activity className="w-4 h-4 text-orange-500" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'session_start':
        return 'border-green-500/20 bg-green-500/5'
      case 'session_end':
        return 'border-blue-500/20 bg-blue-500/5'
      case 'page_view':
        return 'border-purple-500/20 bg-purple-500/5'
      case 'click_cluster':
        return 'border-red-500/20 bg-red-500/5'
      case 'heatmap_update':
        return 'border-orange-500/20 bg-orange-500/5'
      default:
        return 'border-border bg-card'
    }
  }

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded loading-shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary rounded loading-shimmer w-3/4"></div>
                <div className="h-3 bg-secondary rounded loading-shimmer w-1/2"></div>
              </div>
              <div className="h-3 bg-secondary rounded loading-shimmer w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Activity Feed
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Real-time updates
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              Activity will appear here as users interact with your website
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {activity.description}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    {activity.metadata?.page && (
                      <span className="bg-secondary/50 px-2 py-0.5 rounded">
                        {activity.metadata.page}
                      </span>
                    )}
                    {activity.metadata?.duration && (
                      <span>
                        Duration: {formatDuration(activity.metadata.duration)}
                      </span>
                    )}
                    {activity.metadata?.clicks && (
                      <span>
                        {activity.metadata.clicks} clicks
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="p-4 bg-muted/20 text-center">
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            View All Activity
          </button>
        </div>
      )}
    </div>
  )
}