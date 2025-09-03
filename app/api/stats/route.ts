import { NextRequest, NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'
import type { TrackingSession, HeatmapData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteDomain = searchParams.get('domain') || 'localhost:3000'
    const timeframe = searchParams.get('timeframe') || '24h' // 24h, 7d, 30d

    // Get sessions and heatmap data
    const [sessions, heatmaps] = await Promise.all([
      getSessions(100), // Get more sessions for better stats
      getHeatmapData(websiteDomain)
    ])

    // Filter sessions by timeframe
    const now = new Date()
    let cutoffTime: Date

    switch (timeframe) {
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default: // 24h
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
    }

    const recentSessions = sessions.filter(session => 
      new Date(session.created_at) >= cutoffTime
    )

    // Calculate stats
    const totalSessions = recentSessions.length
    const totalPageViews = recentSessions.reduce((sum, session) => 
      sum + (session.metadata.page_views || 0), 0
    )
    const totalClicks = recentSessions.reduce((sum, session) => 
      sum + (session.metadata.total_clicks || 0), 0
    )
    const totalEvents = recentSessions.reduce((sum, session) => 
      sum + (session.metadata.events?.length || 0), 0
    )

    // Calculate average session duration
    const validDurations = recentSessions
      .filter(session => session.metadata.duration > 0)
      .map(session => session.metadata.duration)
    
    const averageDuration = validDurations.length > 0 
      ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length 
      : 0

    // Top pages
    const pageViews: Record<string, number> = {}
    recentSessions.forEach(session => {
      (session.metadata.pages_visited || []).forEach(page => {
        pageViews[page] = (pageViews[page] || 0) + 1
      })
    })

    const topPages = Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }))

    // Bounce rate (sessions with only 1 page view)
    const singlePageSessions = recentSessions.filter(session => 
      (session.metadata.page_views || 0) <= 1
    ).length
    const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0

    // Browser/Device stats
    const userAgents = recentSessions.map(session => session.metadata.user_agent)
    const browsers: Record<string, number> = {}
    const devices: Record<string, number> = {}

    userAgents.forEach(ua => {
      if (!ua) return
      
      // Simple browser detection
      if (ua.includes('Chrome')) browsers['Chrome'] = (browsers['Chrome'] || 0) + 1
      else if (ua.includes('Firefox')) browsers['Firefox'] = (browsers['Firefox'] || 0) + 1
      else if (ua.includes('Safari')) browsers['Safari'] = (browsers['Safari'] || 0) + 1
      else browsers['Other'] = (browsers['Other'] || 0) + 1

      // Simple device detection
      if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
        devices['Mobile'] = (devices['Mobile'] || 0) + 1
      } else if (ua.includes('Tablet') || ua.includes('iPad')) {
        devices['Tablet'] = (devices['Tablet'] || 0) + 1
      } else {
        devices['Desktop'] = (devices['Desktop'] || 0) + 1
      }
    })

    // Recent activity
    const recentActivity = recentSessions
      .slice(0, 10)
      .map(session => ({
        type: 'session',
        description: `New session from ${getUserAgentInfo(session.metadata.user_agent)}`,
        timestamp: session.created_at,
        sessionId: session.id,
        duration: session.metadata.duration,
        pages: session.metadata.pages_visited?.length || 0
      }))

    // Heatmap stats
    const totalHeatmapClicks = heatmaps.reduce((sum, heatmap) => {
      const clickData = Array.isArray(heatmap.metadata.click_data) 
        ? heatmap.metadata.click_data 
        : []
      return sum + clickData.reduce((clickSum, point) => clickSum + (point.count || 0), 0)
    }, 0)

    const stats = {
      overview: {
        totalSessions,
        totalPageViews,
        totalClicks,
        totalEvents,
        averageDuration: Math.round(averageDuration / 1000), // Convert to seconds
        bounceRate: Math.round(bounceRate * 100) / 100
      },
      pages: {
        topPages,
        totalPages: Object.keys(pageViews).length
      },
      technology: {
        browsers: Object.entries(browsers).map(([name, count]) => ({ name, count })),
        devices: Object.entries(devices).map(([name, count]) => ({ name, count }))
      },
      heatmaps: {
        totalHeatmaps: heatmaps.length,
        totalClicks: totalHeatmapClicks,
        pagesWithHeatmaps: heatmaps.map(h => h.metadata.page_url)
      },
      activity: {
        recentSessions: recentActivity,
        sessionsOverTime: getSessionsOverTime(recentSessions, timeframe)
      },
      timeframe
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch statistics'
    }, { status: 500 })
  }
}

function getUserAgentInfo(userAgent: string): string {
  if (!userAgent) return 'Unknown browser'
  
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  
  return 'Unknown browser'
}

function getSessionsOverTime(sessions: TrackingSession[], timeframe: string) {
  const now = new Date()
  const intervals: { label: string; count: number; timestamp: string }[] = []
  
  let intervalCount: number
  let intervalMs: number
  
  switch (timeframe) {
    case '7d':
      intervalCount = 7
      intervalMs = 24 * 60 * 60 * 1000 // 1 day
      break
    case '30d':
      intervalCount = 30
      intervalMs = 24 * 60 * 60 * 1000 // 1 day
      break
    default: // 24h
      intervalCount = 24
      intervalMs = 60 * 60 * 1000 // 1 hour
      break
  }
  
  for (let i = intervalCount - 1; i >= 0; i--) {
    const intervalStart = new Date(now.getTime() - (i + 1) * intervalMs)
    const intervalEnd = new Date(now.getTime() - i * intervalMs)
    
    const count = sessions.filter(session => {
      const sessionTime = new Date(session.created_at)
      return sessionTime >= intervalStart && sessionTime < intervalEnd
    }).length
    
    intervals.push({
      label: timeframe === '24h' 
        ? intervalEnd.getHours().toString().padStart(2, '0') + ':00'
        : intervalEnd.toLocaleDateString(),
      count,
      timestamp: intervalEnd.toISOString()
    })
  }
  
  return intervals
}