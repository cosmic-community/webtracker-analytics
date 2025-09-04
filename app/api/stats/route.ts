import { NextRequest, NextResponse } from 'next/server'
import { getSessions, getHeatmapData } from '@/lib/cosmic'
import type { TrackingSession, HeatmapData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Fetch sessions and heatmap data
    const sessions = await getSessions(100) // Get more sessions for better stats
    const heatmaps = await getHeatmapData('') // Get all heatmaps
    
    // Calculate total sessions
    const totalSessions = sessions.length
    
    // Calculate total page views - Fix the undefined error here
    const totalPageViews = sessions.reduce((total, session) => {
      // Add proper undefined check for session.metadata
      if (!session?.metadata) {
        return total
      }
      return total + (session.metadata.page_views || 0)
    }, 0)
    
    // Calculate average session duration
    const totalDuration = sessions.reduce((total, session) => {
      // Add proper undefined check for session.metadata
      if (!session?.metadata) {
        return total
      }
      return total + (session.metadata.duration || 0)
    }, 0)
    
    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0
    
    // Calculate top pages
    const pageVisits: Record<string, number> = {}
    
    sessions.forEach(session => {
      // Add proper undefined check for session.metadata and pages_visited
      if (!session?.metadata?.pages_visited || !Array.isArray(session.metadata.pages_visited)) {
        return
      }
      
      session.metadata.pages_visited.forEach(page => {
        if (typeof page === 'string') {
          pageVisits[page] = (pageVisits[page] || 0) + 1
        }
      })
    })
    
    const topPages = Object.entries(pageVisits)
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
    
    // Calculate bounce rate (sessions with only 1 page view)
    const singlePageSessions = sessions.filter(session => {
      // Add proper undefined check
      if (!session?.metadata) {
        return false
      }
      return (session.metadata.page_views || 0) === 1
    }).length
    
    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0
    
    // Calculate total events across all sessions
    const totalEvents = sessions.reduce((total, session) => {
      // Add proper undefined check for session.metadata and events
      if (!session?.metadata?.events || !Array.isArray(session.metadata.events)) {
        return total
      }
      return total + session.metadata.events.length
    }, 0)
    
    // Calculate total clicks from heatmaps
    const totalClicks = heatmaps.reduce((total, heatmap) => {
      // Add proper undefined check for heatmap.metadata and click_data
      if (!heatmap?.metadata?.click_data || !Array.isArray(heatmap.metadata.click_data)) {
        return total
      }
      return total + heatmap.metadata.click_data.reduce((clickTotal, point) => {
        return clickTotal + (point.count || 0)
      }, 0)
    }, 0)
    
    // Get recent activity (last 10 sessions)
    const recentActivity = sessions.slice(0, 10).map(session => {
      // Add proper undefined check
      if (!session?.metadata) {
        return {
          type: 'session',
          description: 'Unknown session activity',
          timestamp: session.created_at || new Date().toISOString()
        }
      }
      
      return {
        type: 'session',
        description: `New session on ${session.metadata.website_domain || 'unknown domain'} with ${session.metadata.page_views || 0} page views`,
        timestamp: session.metadata.started_at || session.created_at || new Date().toISOString()
      }
    })
    
    // Calculate device/browser stats from user agents
    const userAgents: Record<string, number> = {}
    sessions.forEach(session => {
      // Add proper undefined check
      if (!session?.metadata?.user_agent) {
        return
      }
      
      const ua = session.metadata.user_agent
      let device = 'Unknown'
      
      if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
        device = 'Mobile'
      } else if (ua.includes('Tablet') || ua.includes('iPad')) {
        device = 'Tablet'
      } else if (ua.includes('Desktop') || ua.includes('Windows') || ua.includes('Macintosh')) {
        device = 'Desktop'
      }
      
      userAgents[device] = (userAgents[device] || 0) + 1
    })
    
    const deviceStats = Object.entries(userAgents)
      .map(([device, count]) => ({ device, count, percentage: Math.round((count / totalSessions) * 100) }))
      .sort((a, b) => b.count - a.count)
    
    const stats = {
      totalSessions,
      totalPageViews,
      totalEvents,
      totalClicks,
      averageDuration,
      bounceRate,
      topPages,
      deviceStats,
      recentActivity,
      heatmapCount: heatmaps.length
    }
    
    return NextResponse.json({
      success: true,
      stats
    })
    
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics',
      stats: {
        totalSessions: 0,
        totalPageViews: 0,
        totalEvents: 0,
        totalClicks: 0,
        averageDuration: 0,
        bounceRate: 0,
        topPages: [],
        deviceStats: [],
        recentActivity: [],
        heatmapCount: 0
      }
    }, { status: 500 })
  }
}