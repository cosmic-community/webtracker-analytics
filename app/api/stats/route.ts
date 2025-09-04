import { NextRequest, NextResponse } from 'next/server'
import { cosmic, getSessions } from '@/lib/cosmic'
import type { SessionStats } from '@/types'

// Helper function for error handling
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export async function GET(request: NextRequest) {
  try {
    // Get all sessions for stats calculation
    const sessions = await getSessions(100) // Get more sessions for better stats

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        totalSessions: 0,
        totalPageViews: 0,
        averageDuration: 0,
        topPages: [],
        bounceRate: 0,
        recentActivity: []
      })
    }

    // Calculate basic stats
    const totalSessions = sessions.length
    const totalPageViews = sessions.reduce((sum, session) => {
      // Fix TypeScript error: Add null check for session.metadata
      if (!session || !session.metadata) return sum
      return sum + (session.metadata.page_views || 0)
    }, 0)

    const totalDuration = sessions.reduce((sum, session) => {
      // Fix TypeScript error: Add null check for session.metadata
      if (!session || !session.metadata) return sum
      return sum + (session.metadata.duration || 0)
    }, 0)

    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0

    // Calculate top pages
    const pageVisits: Record<string, number> = {}
    sessions.forEach(session => {
      // Fix TypeScript error: Add null check for session.metadata and pages_visited
      if (!session || !session.metadata || !session.metadata.pages_visited) return
      
      const pagesVisited = Array.isArray(session.metadata.pages_visited) 
        ? session.metadata.pages_visited 
        : []
        
      pagesVisited.forEach((page: string) => {
        pageVisits[page] = (pageVisits[page] || 0) + 1
      })
    })

    const topPages = Object.entries(pageVisits)
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    // Calculate bounce rate (sessions with only 1 page view)
    const bouncedSessions = sessions.filter(session => {
      // Fix TypeScript error: Add null check for session.metadata
      if (!session || !session.metadata) return false
      return (session.metadata.page_views || 0) === 1
    }).length
    
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0

    // Get recent activity
    const recentActivity = sessions
      .slice(0, 10)
      .map(session => {
        // Fix TypeScript error: Add null check for session.metadata
        if (!session || !session.metadata) {
          return {
            type: 'session',
            description: 'Unknown session activity',
            timestamp: session?.created_at || new Date().toISOString()
          }
        }

        return {
          type: 'session',
          description: `New session from ${session.metadata.website_domain || 'unknown domain'} - ${session.metadata.page_views || 0} page views`,
          timestamp: session.created_at
        }
      })

    const stats: SessionStats = {
      totalSessions,
      totalPageViews,
      averageDuration,
      topPages,
      bounceRate
    }

    return NextResponse.json({
      ...stats,
      recentActivity
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return default stats on error
    return NextResponse.json({
      totalSessions: 0,
      totalPageViews: 0,
      averageDuration: 0,
      topPages: [],
      bounceRate: 0,
      recentActivity: []
    }, { status: 500 })
  }
}