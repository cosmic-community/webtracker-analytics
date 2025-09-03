import { NextRequest, NextResponse } from 'next/server'
import { cosmic, getSessions, getHeatmapData } from '@/lib/cosmic'
import type { SessionStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const websiteDomain = 'localhost:3000' // In production, get from request header

    // Fetch sessions and heatmaps in parallel
    const [sessions, heatmaps] = await Promise.all([
      getSessions(100).catch(() => []), // Fallback to empty array on error
      getHeatmapData(websiteDomain).catch(() => []) // Fallback to empty array on error
    ])

    // Calculate statistics safely
    const totalSessions = sessions.length
    const totalPageViews = sessions.reduce((sum, session) => {
      return sum + (session.metadata?.page_views || 0)
    }, 0)

    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (session.metadata?.duration || 0)
    }, 0)
    
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

    // Calculate top pages safely
    const pageViews: Record<string, number> = {}
    sessions.forEach(session => {
      const pagesVisited = session.metadata?.pages_visited || []
      if (Array.isArray(pagesVisited)) {
        pagesVisited.forEach(page => {
          pageViews[page] = (pageViews[page] || 0) + 1
        })
      }
    })

    const topPages = Object.entries(pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([url, views]) => ({ url, views }))

    // Calculate bounce rate (sessions with only 1 page view)
    const bounceCount = sessions.filter(session => 
      (session.metadata?.page_views || 0) <= 1
    ).length
    const bounceRate = totalSessions > 0 ? (bounceCount / totalSessions) * 100 : 0

    // Calculate total clicks from heatmaps
    const totalClicks = heatmaps.reduce((sum, heatmap) => {
      const clickData = heatmap.metadata?.click_data || []
      if (Array.isArray(clickData)) {
        return sum + clickData.reduce((clickSum, point) => clickSum + (point.count || 0), 0)
      }
      return sum
    }, 0)

    const stats: SessionStats & { totalClicks: number; totalHeatmaps: number } = {
      totalSessions,
      totalPageViews,
      averageDuration,
      topPages,
      bounceRate,
      totalClicks,
      totalHeatmaps: heatmaps.length
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return default stats on error
    const defaultStats = {
      totalSessions: 0,
      totalPageViews: 0,
      averageDuration: 0,
      topPages: [],
      bounceRate: 0,
      totalClicks: 0,
      totalHeatmaps: 0
    }
    
    return NextResponse.json(defaultStats, { status: 200 })
  }
}