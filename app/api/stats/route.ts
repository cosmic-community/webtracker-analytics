import { NextRequest, NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    // Fetch sessions and heatmaps with error handling
    const [sessions, heatmaps] = await Promise.allSettled([
      getSessions(100),
      getHeatmapData('') // Fetch all heatmaps
    ])

    // Handle sessions result
    const sessionsData = sessions.status === 'fulfilled' ? sessions.value : []
    if (sessions.status === 'rejected') {
      console.error('Failed to fetch sessions:', sessions.reason)
    }

    // Handle heatmaps result
    const heatmapsData = heatmaps.status === 'fulfilled' ? heatmaps.value : []
    if (heatmaps.status === 'rejected') {
      console.error('Failed to fetch heatmaps:', heatmaps.reason)
    }

    // Calculate statistics with null checks and default values
    const totalSessions = sessionsData.length
    
    const totalPageViews = sessionsData.reduce((sum, session) => {
      return sum + (Number(session.metadata?.page_views) || 0)
    }, 0)
    
    const averageDuration = sessionsData.length > 0 
      ? sessionsData.reduce((sum, session) => {
          return sum + (Number(session.metadata?.duration) || 0)
        }, 0) / sessionsData.length
      : 0

    // Calculate top pages with proper error handling
    const pageCountMap = new Map<string, number>()
    
    sessionsData.forEach(session => {
      if (session.metadata?.pages_visited && Array.isArray(session.metadata.pages_visited)) {
        session.metadata.pages_visited.forEach((page: string) => {
          if (typeof page === 'string') {
            pageCountMap.set(page, (pageCountMap.get(page) || 0) + 1)
          }
        })
      }
    })

    const topPages = Array.from(pageCountMap.entries())
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    // Calculate bounce rate (sessions with only 1 page view)
    const bouncedSessions = sessionsData.filter(session => 
      (Number(session.metadata?.page_views) || 0) <= 1
    ).length
    
    const bounceRate = totalSessions > 0 
      ? Math.round((bouncedSessions / totalSessions) * 100) 
      : 0

    // Calculate total clicks from heatmaps
    const totalClicks = heatmapsData.reduce((sum, heatmap) => {
      const clickData = heatmap.metadata?.click_data
      if (Array.isArray(clickData)) {
        return sum + clickData.reduce((clickSum, point) => clickSum + (point.count || 0), 0)
      }
      return sum
    }, 0)

    const stats = {
      totalSessions,
      totalPageViews,
      averageDuration: Math.round(averageDuration),
      topPages,
      bounceRate,
      totalClicks,
      totalHeatmaps: heatmapsData.length,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return empty stats instead of error to prevent frontend crashes
    const fallbackStats = {
      totalSessions: 0,
      totalPageViews: 0,
      averageDuration: 0,
      topPages: [],
      bounceRate: 0,
      totalClicks: 0,
      totalHeatmaps: 0,
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch stats'
    }
    
    return NextResponse.json(fallbackStats, { status: 200 }) // Return 200 to prevent frontend errors
  }
}