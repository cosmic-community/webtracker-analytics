import { NextRequest, NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'
import type { TrackingSession, HeatmapData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d' // 7d, 30d, 90d
    
    // Fetch all sessions and heatmaps
    const [sessions, heatmaps] = await Promise.all([
      getSessions(200),
      getHeatmapData('')
    ])

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Filter sessions by date range
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.created_at)
      return sessionDate >= startDate && sessionDate <= now
    })

    // Calculate statistics
    const totalSessions = filteredSessions.length
    const totalPageViews = filteredSessions.reduce((sum, session) => {
      return sum + (session.metadata?.page_views || 0)
    }, 0)
    
    const totalEvents = filteredSessions.reduce((sum, session) => {
      return sum + (session.metadata?.events?.length || 0)
    }, 0)

    const totalClicks = filteredSessions.reduce((sum, session) => {
      return sum + (session.metadata?.total_clicks || 0)
    }, 0)

    // Calculate average session duration
    const totalDuration = filteredSessions.reduce((sum, session) => {
      return sum + (session.metadata?.duration || 0)
    }, 0)
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

    // Calculate bounce rate (sessions with only 1 page view)
    const bounceCount = filteredSessions.filter(session => 
      (session.metadata?.page_views || 0) <= 1
    ).length
    const bounceRate = totalSessions > 0 ? (bounceCount / totalSessions) * 100 : 0

    // Get top pages by visits
    const pageVisits: Record<string, number> = {}
    filteredSessions.forEach(session => {
      const pagesVisited = session.metadata?.pages_visited || ['/']
      pagesVisited.forEach(page => {
        pageVisits[page] = (pageVisits[page] || 0) + 1
      })
    })

    const topPages = Object.entries(pageVisits)
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Calculate growth metrics (compared to previous period)
    const previousStartDate = new Date(startDate)
    const daysDiff = Math.floor((startDate.getTime() - previousStartDate.getTime()) / (1000 * 60 * 60 * 24))
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff)

    const previousSessions = sessions.filter(session => {
      const sessionDate = new Date(session.created_at)
      return sessionDate >= previousStartDate && sessionDate < startDate
    })

    const sessionGrowth = previousSessions.length > 0 
      ? ((totalSessions - previousSessions.length) / previousSessions.length) * 100 
      : 0

    // Get daily session data for charts
    const dailyData: Record<string, number> = {}
    filteredSessions.forEach(session => {
      const date = new Date(session.created_at).toISOString().split('T')[0]
      dailyData[date] = (dailyData[date] || 0) + 1
    })

    const chartData = Object.entries(dailyData)
      .map(([date, sessions]) => ({ date, sessions }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Recent activity (last 10 sessions)
    const recentActivity = filteredSessions
      .slice(0, 10)
      .map(session => {
        const lastEvent = session.metadata?.events?.[session.metadata.events.length - 1]
        const activityType = lastEvent?.type || 'pageview'
        const pageUrl = session.metadata?.pages_visited?.[0] || '/'
        
        return {
          id: session.id,
          type: 'session',
          description: `New ${activityType} on ${pageUrl}`,
          timestamp: session.created_at,
          sessionId: session.metadata?.session_id,
          pageUrl
        }
      })

    // Heatmap statistics
    const totalHeatmaps = heatmaps.length
    const totalHeatmapClicks = heatmaps.reduce((sum, heatmap) => {
      const clickData = heatmap.metadata?.click_data
      if (Array.isArray(clickData)) {
        return sum + clickData.reduce((clickSum, point) => clickSum + (point.count || 0), 0)
      }
      return sum
    }, 0)

    const stats = {
      overview: {
        totalSessions,
        totalPageViews,
        totalEvents,
        totalClicks,
        averageDuration: Math.round(averageDuration),
        bounceRate: Math.round(bounceRate * 100) / 100,
        sessionGrowth: Math.round(sessionGrowth * 100) / 100
      },
      topPages,
      chartData,
      recentActivity,
      heatmaps: {
        total: totalHeatmaps,
        totalClicks: totalHeatmapClicks
      },
      timeRange,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error calculating stats:', error)
    return NextResponse.json({ 
      error: 'Failed to calculate statistics',
      overview: {
        totalSessions: 0,
        totalPageViews: 0,
        totalEvents: 0,
        totalClicks: 0,
        averageDuration: 0,
        bounceRate: 0,
        sessionGrowth: 0
      },
      topPages: [],
      chartData: [],
      recentActivity: [],
      heatmaps: { total: 0, totalClicks: 0 }
    }, { status: 500 })
  }
}