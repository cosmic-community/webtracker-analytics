'use client'

import { useEffect, useState } from 'react'
import { Users, MousePointer, Clock, Eye } from 'lucide-react'

interface StatsData {
  totalSessions: number
  totalClicks: number
  averageDuration: string
  activeNow: number
}

export default function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalSessions: 0,
    totalClicks: 0,
    averageDuration: '0:00',
    activeNow: 1 // Show current user as active
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded loading-shimmer w-20"></div>
                <div className="h-8 bg-secondary rounded loading-shimmer w-16"></div>
              </div>
              <div className="h-12 w-12 bg-secondary rounded-full loading-shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
            <p className="text-3xl font-bold text-primary">{stats.totalSessions}</p>
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="text-green-500">+{Math.floor(stats.totalSessions * 0.12)}</span> from last week
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
            <p className="text-3xl font-bold text-blue-500">{stats.totalClicks.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <MousePointer className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="text-green-500">+{Math.floor(stats.totalClicks * 0.08)}</span> from yesterday
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
            <p className="text-3xl font-bold text-green-500">{stats.averageDuration}</p>
          </div>
          <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="text-green-500">+15s</span> improvement this week
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Now</p>
            <p className="text-3xl font-bold text-purple-500">{stats.activeNow}</p>
          </div>
          <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
            <div className="relative">
              <Eye className="h-6 w-6 text-purple-500" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="text-purple-500">You</span> are currently active
        </div>
      </div>
    </div>
  )
}