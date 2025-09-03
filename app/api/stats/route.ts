import { NextRequest, NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    const websiteDomain = 'localhost:3000' // In production, get from request header or config
    
    // Fetch sessions and heatmaps
    const [sessions, heatmaps] = await Promise.all([
      getSessions(100), // Get up to 100 sessions for stats
      getHeatmapData(websiteDomain)
    ])

    // Calculate session stats
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.metadata.ended_at).length
    const activeSessions = sessions.filter(s => {
      if (s.metadata.ended_at) return false
      const startTime = new Date(s.metadata.started_at).getTime()
      const now = Date.now()
      return (now - startTime) < 30 * 60 * 1000 // Active if within last 30 minutes
    }).length

    // Calculate total clicks from heatmaps
    const totalClicks = heatmaps.reduce((total, heatmap) => {
      const clickData = heatmap.metadata?.click_data
      if (Array.isArray(clickData)) {
        return total + clickData.reduce((sum, point) => sum + (point.count || 0), 0)
      }
      return total
    }, 0)

    // Calculate average duration
    const durationsMs = sessions
      .filter(s => s.metadata.duration > 0)
      .map(s => s.metadata.duration)
    
    const avgDurationMs = durationsMs.length > 0 
      ? durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length 
      : 0

    const formatDuration = (ms: number): string => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
    }

    const stats = {
      totalSessions,
      totalClicks,
      averageDuration: formatDuration(avgDurationMs),
      activeNow: Math.max(activeSessions, 1), // Show at least 1 (current user)
      completedSessions,
      totalPageViews: sessions.reduce((total, session) => total + (session.metadata.page_views || 0), 0),
      totalScrolls: sessions.reduce((total, session) => total + (session.metadata.total_scrolls || 0), 0),
      totalEvents: sessions.reduce((total, session) => {
        const events = session.metadata.events
        return total + (Array.isArray(events) ? events.length : 0)
      }, 0),
      recentSessions: sessions.slice(0, 5).map(session => ({
        id: session.id,
        duration: session.metadata.duration,
        startedAt: session.metadata.started_at,
        status: session.metadata.ended_at ? 'completed' : 'active',
        pageViews: session.metadata.page_views,
        clicks: session.metadata.total_clicks
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ 
      totalSessions: 0,
      totalClicks: 0,
      averageDuration: '0:00',
      activeNow: 1,
      completedSessions: 0,
      totalPageViews: 0,
      totalScrolls: 0,
      totalEvents: 0,
      recentSessions: [],
      error: 'Failed to fetch stats'
    }, { status: 500 })
  }
}