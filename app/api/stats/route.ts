import { NextRequest, NextResponse } from 'next/server'
import { cosmic, getSessions, getHeatmapData } from '@/lib/cosmic'
import type { TrackingSession, HeatmapData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain') || 'localhost:3000'
    const period = searchParams.get('period') || '7d' // 24h, 7d, 30d

    // Get sessions and heatmap data
    const sessions = await getSessions(1000) // Get more data for stats
    const heatmaps = await getHeatmapData('') // Get all heatmaps

    // Calculate time range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '7d':
      default:
        startDate.setDate(now.getDate() - 7)
        break
    }

    // Filter sessions by time period
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.created_at)
      return sessionDate >= startDate && sessionDate <= now
    })

    // Calculate basic stats
    const totalSessions = filteredSessions.length
    const totalPageViews = filteredSessions.reduce((sum, session) => 
      sum + (session.metadata.page_views || 0), 0)
    const totalEvents = filteredSessions.reduce((sum, session) => 
      sum + (Array.isArray(session.metadata.events) ? session.metadata.events.length : 0), 0)
    
    const averageDuration = filteredSessions.length > 0 
      ? filteredSessions.reduce((sum, session) => sum + (session.metadata.duration || 0), 0) / filteredSessions.length
      : 0

    // Calculate bounce rate (sessions with only 1 page view)
    const bouncedSessions = filteredSessions.filter(session => 
      (session.metadata.page_views || 0) <= 1).length
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0

    // Get top pages
    const pageViews: Record<string, number> = {}
    filteredSessions.forEach(session => {
      if (Array.isArray(session.metadata.pages_visited)) {
        session.metadata.pages_visited.forEach(page => {
          pageViews[page] = (pageViews[page] || 0) + 1
        })
      }
    })

    const topPages = Object.entries(pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([url, views]) => ({ url, views }))

    // Device type analysis
    const deviceTypes: Record<string, number> = {
      Mobile: 0,
      Tablet: 0, 
      Desktop: 0,
      Other: 0
    }

    filteredSessions.forEach(session => {
      const userAgent = session.metadata.user_agent || ''
      
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        if (/iPad/.test(userAgent)) {
          deviceTypes.Tablet += 1
        } else {
          deviceTypes.Mobile += 1
        }
      } else if (/Tablet/.test(userAgent)) {
        deviceTypes.Tablet += 1
      } else if (/Windows|Mac|Linux/.test(userAgent)) {
        deviceTypes.Desktop += 1
      } else {
        deviceTypes.Other += 1
      }
    })

    // FIXED: Add null checks for deviceTypes properties to resolve TS18048 errors
    const deviceStats = [
      { name: 'Mobile', value: deviceTypes.Mobile || 0, color: '#3B82F6' },
      { name: 'Tablet', value: deviceTypes.Tablet || 0, color: '#10B981' },
      { name: 'Desktop', value: deviceTypes.Desktop || 0, color: '#F59E0B' },
      { name: 'Other', value: deviceTypes.Other || 0, color: '#EF4444' }
    ]

    // Sessions over time (daily breakdown)
    const sessionsOverTime: Record<string, number> = {}
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      sessionsOverTime[dateKey] = 0
    }

    filteredSessions.forEach(session => {
      const sessionDate = new Date(session.created_at).toISOString().split('T')[0]
      if (sessionsOverTime.hasOwnProperty(sessionDate)) {
        sessionsOverTime[sessionDate] += 1
      }
    })

    const sessionsChart = Object.entries(sessionsOverTime)
      .map(([date, sessions]) => ({
        date,
        sessions,
        formatted_date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Heatmap stats
    const totalHeatmaps = heatmaps.length
    const totalClicks = heatmaps.reduce((sum, heatmap) => {
      const clickData = Array.isArray(heatmap.metadata?.click_data) 
        ? heatmap.metadata.click_data 
        : []
      return sum + clickData.reduce((clickSum, point) => clickSum + (point.count || 0), 0)
    }, 0)

    // Recent activity (last 10 sessions)
    const recentActivity = filteredSessions
      .slice(0, 10)
      .map(session => ({
        type: 'session',
        description: `New session from ${getDeviceType(session.metadata.user_agent)}`,
        timestamp: session.created_at,
        session_id: session.id,
        duration: session.metadata.duration || 0,
        page_views: session.metadata.page_views || 0
      }))

    const stats = {
      overview: {
        totalSessions,
        totalPageViews,
        totalEvents,
        averageDuration: Math.round(averageDuration / 1000), // Convert to seconds
        bounceRate: Math.round(bounceRate * 100) / 100,
        totalHeatmaps,
        totalClicks
      },
      topPages,
      deviceStats: deviceStats.filter(device => device.value > 0), // Only show devices with data
      sessionsChart,
      recentActivity,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data',
      overview: {
        totalSessions: 0,
        totalPageViews: 0,
        totalEvents: 0,
        averageDuration: 0,
        bounceRate: 0,
        totalHeatmaps: 0,
        totalClicks: 0
      },
      topPages: [],
      deviceStats: [],
      sessionsChart: [],
      recentActivity: []
    }, { status: 500 })
  }
}

function getDeviceType(userAgent: string = ''): string {
  if (/iPad/.test(userAgent)) return 'Tablet'
  if (/Mobile|Android|iPhone/.test(userAgent)) return 'Mobile'
  if (/Tablet/.test(userAgent)) return 'Tablet'
  if (/Windows|Mac|Linux/.test(userAgent)) return 'Desktop'
  return 'Unknown'
}