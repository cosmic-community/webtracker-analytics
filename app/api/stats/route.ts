import { NextRequest, NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'
import type { TrackingSession, SessionStats, TrackingEvent } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 24h, 7d, 30d
    const limit = parseInt(searchParams.get('limit') || '100')
    
    // Get recent sessions
    const sessions = await getSessions(limit)
    
    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }
    
    // Filter sessions by date range
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.created_at)
      return sessionDate >= startDate && sessionDate <= now
    })

    // Calculate statistics safely
    const totalSessions = filteredSessions.length
    const totalPageViews = filteredSessions.reduce((sum, session) => {
      return sum + (session.metadata?.page_views || 0)
    }, 0)
    
    const totalEvents = filteredSessions.reduce((sum, session) => {
      const events = session.metadata?.events
      return sum + (Array.isArray(events) ? events.length : 0)
    }, 0)

    // Calculate average session duration safely
    const durationsSum = filteredSessions.reduce((sum, session) => {
      return sum + (session.metadata?.duration || 0)
    }, 0)
    const averageDuration = totalSessions > 0 ? Math.round(durationsSum / totalSessions) : 0

    // Calculate bounce rate (sessions with only 1 page view)
    const bouncedSessions = filteredSessions.filter(session => {
      return (session.metadata?.page_views || 0) <= 1
    }).length
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0

    // Get top pages with safe access
    const pageViewCounts: Record<string, number> = {}
    
    filteredSessions.forEach(session => {
      const pagesVisited = session.metadata?.pages_visited
      if (Array.isArray(pagesVisited)) {
        pagesVisited.forEach(page => {
          if (typeof page === 'string') {
            pageViewCounts[page] = (pageViewCounts[page] || 0) + 1
          }
        })
      }
    })

    const topPages = Object.entries(pageViewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }))

    // Calculate hourly activity for the chart
    const hourlyActivity: Record<string, number> = {}
    
    // Initialize all hours with 0
    for (let hour = 0; hour < 24; hour++) {
      const hourKey = hour.toString().padStart(2, '0') + ':00'
      hourlyActivity[hourKey] = 0
    }
    
    filteredSessions.forEach(session => {
      const sessionDate = new Date(session.created_at)
      const hour = sessionDate.getHours()
      const hourKey = hour.toString().padStart(2, '0') + ':00'
      
      // Safe access to hourlyActivity
      if (hourKey in hourlyActivity) {
        hourlyActivity[hourKey] += 1
      }
    })

    const hourlyData = Object.entries(hourlyActivity).map(([hour, sessions]) => ({
      hour,
      sessions
    }))

    // Get recent heatmaps
    const heatmaps = await getHeatmapData('')

    // Calculate device types from user agents
    const deviceTypes: Record<string, number> = {
      Mobile: 0,
      Desktop: 0,
      Tablet: 0,
      Other: 0
    }

    filteredSessions.forEach(session => {
      const userAgent = session.metadata?.user_agent || ''
      if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
        deviceTypes.Mobile++
      } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceTypes.Tablet++
      } else if (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux')) {
        deviceTypes.Desktop++
      } else {
        deviceTypes.Other++
      }
    })

    const deviceData = Object.entries(deviceTypes).map(([device, count]) => ({
      device,
      count,
      percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
    }))

    const stats: SessionStats = {
      totalSessions,
      totalPageViews,
      averageDuration,
      topPages,
      bounceRate
    }

    return NextResponse.json({
      stats,
      hourlyActivity: hourlyData,
      deviceBreakdown: deviceData,
      totalEvents,
      heatmapsCount: heatmaps.length,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating stats:', error)
    return NextResponse.json({ 
      error: 'Failed to generate statistics',
      stats: {
        totalSessions: 0,
        totalPageViews: 0,
        averageDuration: 0,
        topPages: [],
        bounceRate: 0
      },
      hourlyActivity: [],
      deviceBreakdown: [],
      totalEvents: 0,
      heatmapsCount: 0
    }, { status: 500 })
  }
}