'use client'

import { useEffect, useState } from 'react'
import { Users, Eye, MousePointer, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface OverviewStats {
  totalSessions: number
  totalPageViews: number
  totalEvents: number
  totalClicks: number
  averageDuration: number
  bounceRate: number
  sessionGrowth: number
}

export default function StatsCards() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/stats?timeRange=7d')
        if (response.ok) {
          const data = await response.json()
          setStats(data.overview)
        } else {
          setError('Failed to fetch statistics')
          setStats({
            totalSessions: 0,
            totalPageViews: 0,
            totalEvents: 0,
            totalClicks: 0,
            averageDuration: 0,
            bounceRate: 0,
            sessionGrowth: 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        setError('Network error while fetching statistics')
        setStats({
          totalSessions: 0,
          totalPageViews: 0,
          totalEvents: 0,
          totalClicks: 0,
          averageDuration: 0,
          bounceRate: 0,
          sessionGrowth: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
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

  const formatGrowth = (growth: number): { text: string; color: string; icon: any } => {
    if (growth > 0) {
      return {
        text: `+${growth.toFixed(1)}%`,
        color: 'text-green-600',
        icon: TrendingUp
      }
    } else if (growth < 0) {
      return {
        text: `${growth.toFixed(1)}%`,
        color: 'text-red-600',
        icon: TrendingDown
      }
    } else {
      return {
        text: '0%',
        color: 'text-gray-500',
        icon: TrendingUp
      }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-secondary rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-secondary rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-8 bg-secondary rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-secondary rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">
          {error || 'Unable to load statistics'}
        </p>
        <p className="text-red-500 text-sm mt-1">
          Stats will be available once tracking data is collected
        </p>
      </div>
    )
  }

  const growth = formatGrowth(stats.sessionGrowth)
  const GrowthIcon = growth.icon

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Sessions */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${growth.color}`}>
            <GrowthIcon className="w-4 h-4" />
            {growth.text}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground">
            {stats.totalSessions.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
        </div>
      </div>

      {/* Page Views */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-sm text-muted-foreground">
            Last 7 days
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground">
            {stats.totalPageViews.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Page Views</p>
        </div>
      </div>

      {/* Total Clicks */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
            <MousePointer className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-sm text-muted-foreground">
            Click events
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground">
            {stats.totalClicks.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Total Clicks</p>
        </div>
      </div>

      {/* Average Duration */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-sm text-muted-foreground">
            Per session
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground">
            {formatDuration(stats.averageDuration)}
          </div>
          <p className="text-sm text-muted-foreground">Avg. Duration</p>
        </div>
      </div>
    </div>
  )
}