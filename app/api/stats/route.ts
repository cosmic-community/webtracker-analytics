import { NextRequest, NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Fetch sessions and heatmaps
    const [sessions, heatmaps] = await Promise.all([
      getSessions(limit),
      getHeatmapData('') // Empty string to get all heatmaps
    ])

    // Calculate basic stats
    const totalSessions = sessions.length
    const totalPageViews = sessions.reduce((sum, session) => 
      sum + (session.metadata?.page_views || 0), 0
    )

    // Calculate average duration
    const durationsWithValues = sessions
      .map(s => s.metadata?.duration || 0)
      .filter(d => d > 0)
    
    const averageDuration = durationsWithValues.length > 0 
      ? Math.round(durationsWithValues.reduce((sum, d) => sum + d, 0) / durationsWithValues.length)
      : 0

    // Calculate top pages
    const pageViewCounts: Record<string, number> = {}
    sessions.forEach(session => {
      const pages = session.metadata?.pages_visited || []
      if (Array.isArray(pages)) {
        pages.forEach(page => {
          if (typeof page === 'string') {
            pageViewCounts[page] = (pageViewCounts[page] || 0) + 1
          }
        })
      }
    })

    const topPages = Object.entries(pageViewCounts)
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    // Calculate bounce rate (sessions with only 1 page view)
    const singlePageSessions = sessions.filter(s => (s.metadata?.page_views || 0) <= 1).length
    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0

    // Device type analysis with proper undefined checks
    const deviceTypes = {
      Desktop: 0,
      Mobile: 0,
      Tablet: 0,
      Other: 0
    }

    sessions.forEach(session => {
      const userAgent = session.metadata?.user_agent || ''
      if (userAgent.includes('Mobile')) {
        deviceTypes.Mobile += 1
      } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
        deviceTypes.Tablet += 1
      } else if (userAgent.includes('Mozilla') && !userAgent.includes('Mobile')) {
        deviceTypes.Desktop += 1
      } else {
        deviceTypes.Other += 1
      }
    })

    // Calculate device percentages with proper undefined checks
    const devicePercentages = {
      Desktop: totalSessions > 0 ? Math.round((deviceTypes.Desktop / totalSessions) * 100) : 0,
      Mobile: totalSessions > 0 ? Math.round((deviceTypes.Mobile / totalSessions) * 100) : 0,
      Tablet: totalSessions > 0 ? Math.round((deviceTypes.Tablet / totalSessions) * 100) : 0,
      Other: totalSessions > 0 ? Math.round((deviceTypes.Other / totalSessions) * 100) : 0
    }

    // Browser analysis with proper undefined checks
    const browsers: Record<string, number> = {}
    sessions.forEach(session => {
      const userAgent = session.metadata?.user_agent || ''
      let browserName = 'Other'
      
      if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
        browserName = 'Chrome'
      } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox'
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari'
      } else if (userAgent.includes('Edge')) {
        browserName = 'Edge'
      }
      
      browsers[browserName] = (browsers[browserName] || 0) + 1
    })

    // Convert to percentages with proper validation
    const browserPercentages: Record<string, number> = {}
    Object.entries(browsers).forEach(([browser, count]) => {
      if (typeof count === 'number' && totalSessions > 0) {
        browserPercentages[browser] = Math.round((count / totalSessions) * 100)
      }
    })

    // Calculate hourly distribution with proper undefined checks
    const hourlyData: Record<string, number> = {}
    sessions.forEach(session => {
      const startedAt = session.metadata?.started_at
      if (startedAt && typeof startedAt === 'string') {
        try {
          const hour = new Date(startedAt).getHours()
          const hourKey = `${hour}:00`
          hourlyData[hourKey] = (hourlyData[hourKey] || 0) + 1
        } catch (error) {
          // Invalid date string, skip this session
        }
      }
    })

    // Recent activity with proper validation
    const recentActivity = sessions
      .slice(0, 10)
      .map(session => {
        const startedAt = session.metadata?.started_at
        const pages = session.metadata?.pages_visited
        const pageCount = Array.isArray(pages) ? pages.length : 0
        
        return {
          type: 'session',
          description: `New session with ${pageCount} page view${pageCount !== 1 ? 's' : ''}`,
          timestamp: startedAt || new Date().toISOString(),
          sessionId: session.metadata?.session_id || session.id
        }
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate total clicks from heatmaps with proper validation
    const totalClicks = heatmaps.reduce((sum, heatmap) => {
      const clickData = heatmap.metadata?.click_data
      if (Array.isArray(clickData)) {
        return sum + clickData.reduce((clickSum, point) => 
          clickSum + (point?.count || 0), 0
        )
      }
      return sum
    }, 0)

    return NextResponse.json({
      totalSessions,
      totalPageViews,
      averageDuration,
      topPages,
      bounceRate,
      deviceTypes: devicePercentages,
      browsers: browserPercentages,
      hourlyData,
      recentActivity,
      totalClicks,
      totalHeatmaps: heatmaps.length
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch statistics',
      totalSessions: 0,
      totalPageViews: 0,
      averageDuration: 0,
      topPages: [],
      bounceRate: 0,
      deviceTypes: { Desktop: 0, Mobile: 0, Tablet: 0, Other: 0 },
      browsers: {},
      hourlyData: {},
      recentActivity: [],
      totalClicks: 0,
      totalHeatmaps: 0
    }, { status: 500 })
  }
}