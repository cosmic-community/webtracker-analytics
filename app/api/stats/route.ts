import { NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'
import type { TrackingSession, HeatmapData } from '@/types'

export async function GET() {
  try {
    // Fetch sessions and heatmaps data
    const sessions = await getSessions(100)
    const heatmaps = await getHeatmapData('')

    // Basic stats
    const totalSessions = sessions.length
    const totalPageViews = sessions.reduce((sum, session) => {
      return sum + (session.metadata?.page_views || 0)
    }, 0)

    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (session.metadata?.duration || 0)
    }, 0)

    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0

    // Calculate total clicks from heatmap data
    const totalClicks = heatmaps.reduce((sum, heatmap) => {
      const clickData = heatmap.metadata?.click_data
      if (Array.isArray(clickData)) {
        return sum + clickData.reduce((clickSum, point) => clickSum + (point.count || 0), 0)
      }
      return sum
    }, 0)

    // Page views analysis - safely handle pages_visited array
    const pageViewCounts: Record<string, number> = {}
    sessions.forEach(session => {
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
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([url, views]) => ({ url, views }))

    // Device type analysis - safely parse user agents
    const deviceTypes: Record<string, number> = {
      Mobile: 0,
      Tablet: 0,
      Desktop: 0,
      Other: 0
    }

    sessions.forEach(session => {
      const userAgent = session.metadata?.user_agent
      if (typeof userAgent === 'string') {
        const ua = userAgent.toLowerCase()
        
        if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
          deviceTypes.Mobile += 1
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          deviceTypes.Tablet += 1
        } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox')) {
          deviceTypes.Desktop += 1
        } else {
          deviceTypes.Other += 1
        }
      } else {
        // If user_agent is undefined or not a string, count as Other
        deviceTypes.Other += 1
      }
    })

    // Session duration distribution
    const durationRanges = {
      '0-30s': 0,
      '30s-1m': 0,
      '1m-5m': 0,
      '5m+': 0
    }

    sessions.forEach(session => {
      const duration = session.metadata?.duration || 0
      const durationInSeconds = duration / 1000

      if (durationInSeconds <= 30) {
        durationRanges['0-30s'] += 1
      } else if (durationInSeconds <= 60) {
        durationRanges['30s-1m'] += 1
      } else if (durationInSeconds <= 300) {
        durationRanges['1m-5m'] += 1
      } else {
        durationRanges['5m+'] += 1
      }
    })

    // Calculate bounce rate (sessions with only 1 page view)
    const bouncedSessions = sessions.filter(session => {
      const pageViews = session.metadata?.page_views || 0
      return pageViews <= 1
    }).length

    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0

    // Recent activity (last 10 sessions)
    const recentSessions = sessions.slice(0, 10)
    const recentActivity = recentSessions.map(session => ({
      type: 'session',
      description: `Session from ${session.metadata?.pages_visited?.[0] || 'unknown page'}`,
      timestamp: session.created_at,
      sessionId: session.id,
      duration: session.metadata?.duration || 0,
      pageViews: session.metadata?.page_views || 0
    }))

    // Return comprehensive stats
    return NextResponse.json({
      overview: {
        totalSessions,
        totalPageViews,
        totalClicks,
        averageDuration,
        bounceRate
      },
      topPages,
      deviceTypes: {
        // CRITICAL FIX: Safely access deviceTypes properties with fallback values
        Mobile: deviceTypes.Mobile || 0,
        Tablet: deviceTypes.Tablet || 0,
        Desktop: deviceTypes.Desktop || 0,
        Other: deviceTypes.Other || 0
      },
      durationRanges,
      recentActivity,
      heatmapStats: {
        totalHeatmaps: heatmaps.length,
        totalHotspots: heatmaps.reduce((sum, heatmap) => {
          const clickData = heatmap.metadata?.click_data
          if (Array.isArray(clickData)) {
            return sum + clickData.filter(point => (point.count || 0) > 2).length
          }
          return sum
        }, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      overview: {
        totalSessions: 0,
        totalPageViews: 0,
        totalClicks: 0,
        averageDuration: 0,
        bounceRate: 0
      },
      topPages: [],
      deviceTypes: {
        Mobile: 0,
        Tablet: 0,
        Desktop: 0,
        Other: 0
      },
      durationRanges: {
        '0-30s': 0,
        '30s-1m': 0,
        '1m-5m': 0,
        '5m+': 0
      },
      recentActivity: [],
      heatmapStats: {
        totalHeatmaps: 0,
        totalHotspots: 0
      },
      error: 'Failed to fetch stats'
    }, { status: 500 })
  }
}