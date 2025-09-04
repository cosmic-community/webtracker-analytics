import { NextRequest, NextResponse } from 'next/server'
import { getSessions } from '@/lib/cosmic'
import type { TrackingSession } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const sessions = await getSessions(100) // Get more sessions for better stats

    // Calculate basic stats
    const totalSessions = sessions.length
    const totalPageViews = sessions.reduce((sum, session) => sum + (session.metadata?.page_views || 0), 0)
    const totalEvents = sessions.reduce((sum, session) => sum + (session.metadata?.events?.length || 0), 0)

    // Calculate average duration
    const totalDuration = sessions.reduce((sum, session) => sum + (session.metadata?.duration || 0), 0)
    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0

    // Calculate device types with proper undefined checks
    const deviceTypes = sessions.reduce((acc, session) => {
      const userAgent = session.metadata?.user_agent || ''
      let deviceType = 'Other'

      if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
        deviceType = 'Mobile'
      } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceType = 'Tablet'
      } else if (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux')) {
        deviceType = 'Desktop'
      }

      // Initialize property if it doesn't exist
      if (!acc[deviceType]) {
        acc[deviceType] = 0
      }
      acc[deviceType]++
      
      return acc
    }, {} as Record<string, number>)

    // Calculate top pages with proper undefined checks
    const pageViews = sessions.reduce((acc, session) => {
      const pagesVisited = session.metadata?.pages_visited || ['/']
      
      // Ensure pages_visited is an array
      const pages = Array.isArray(pagesVisited) ? pagesVisited : ['/']
      
      pages.forEach(page => {
        if (typeof page === 'string') {
          // Initialize property if it doesn't exist
          if (!acc[page]) {
            acc[page] = 0
          }
          acc[page]++
        }
      })
      
      return acc
    }, {} as Record<string, number>)

    // Convert to sorted array with proper undefined checks
    const topPages = Object.entries(pageViews)
      .filter(([url, count]) => url && typeof count === 'number')
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }))

    // Calculate bounce rate (sessions with only 1 page view)
    const bouncedSessions = sessions.filter(session => (session.metadata?.page_views || 0) <= 1).length
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0

    // Get recent sessions
    const recentSessions = sessions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(session => ({
        id: session.id,
        session_id: session.metadata?.session_id || '',
        duration: session.metadata?.duration || 0,
        page_views: session.metadata?.page_views || 0,
        started_at: session.metadata?.started_at || session.created_at,
        pages_visited: Array.isArray(session.metadata?.pages_visited) ? session.metadata.pages_visited : ['/']
      }))

    // Build device breakdown with safe property access
    const deviceBreakdown = [
      {
        name: 'Desktop',
        value: deviceTypes.Desktop || 0,
        percentage: totalSessions > 0 ? Math.round(((deviceTypes.Desktop || 0) / totalSessions) * 100) : 0
      },
      {
        name: 'Mobile',
        value: deviceTypes.Mobile || 0,
        percentage: totalSessions > 0 ? Math.round(((deviceTypes.Mobile || 0) / totalSessions) * 100) : 0
      },
      {
        name: 'Tablet',
        value: deviceTypes.Tablet || 0,
        percentage: totalSessions > 0 ? Math.round(((deviceTypes.Tablet || 0) / totalSessions) * 100) : 0
      },
      {
        name: 'Other',
        value: deviceTypes.Other || 0,
        percentage: totalSessions > 0 ? Math.round(((deviceTypes.Other || 0) / totalSessions) * 100) : 0
      }
    ]

    return NextResponse.json({
      overview: {
        totalSessions,
        totalPageViews,
        totalEvents,
        averageDuration,
        bounceRate
      },
      deviceBreakdown,
      topPages,
      recentSessions,
      timeRange: {
        start: sessions.length > 0 ? sessions[sessions.length - 1]?.created_at : null,
        end: sessions.length > 0 ? sessions[0]?.created_at : null
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch statistics',
      overview: {
        totalSessions: 0,
        totalPageViews: 0,
        totalEvents: 0,
        averageDuration: 0,
        bounceRate: 0
      },
      deviceBreakdown: [],
      topPages: [],
      recentSessions: []
    }, { status: 500 })
  }
}