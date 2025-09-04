import { NextRequest, NextResponse } from 'next/server'
import { cosmic, getSessions, getSession, createSession, updateSession } from '@/lib/cosmic'
import type { TrackingSession, TrackingEvent } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (sessionId) {
      // Get specific session
      const session = await getSession(sessionId)
      if (session) {
        return NextResponse.json({ session })
      } else {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
    } else {
      // Get all sessions
      const sessions = await getSessions(limit)
      return NextResponse.json({ sessions, total: sessions.length })
    }
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ 
      sessions: [],
      total: 0,
      error: 'Failed to fetch sessions'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, website_domain, events, user_agent, duration } = body

    if (!session_id || !website_domain) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Check if session already exists
    let session = await getSession(session_id)
    
    if (session) {
      // Update existing session
      const existingEvents = Array.isArray(session.metadata.events) ? session.metadata.events : []
      const newEvents = Array.isArray(events) ? events : []
      const allEvents = [...existingEvents, ...newEvents]
      
      // Calculate session statistics
      const clickEvents = allEvents.filter((e: TrackingEvent) => e.type === 'click')
      const scrollEvents = allEvents.filter((e: TrackingEvent) => e.type === 'scroll')
      const pageviewEvents = allEvents.filter((e: TrackingEvent) => e.type === 'pageview')
      
      // Get unique pages visited
      const pagesVisited = Array.from(new Set(
        pageviewEvents.map((e: TrackingEvent) => {
          try {
            const url = new URL(e.url)
            return url.pathname
          } catch {
            return e.url
          }
        })
      ))

      const sessionData = {
        events: allEvents,
        duration: duration || session.metadata.duration || 0,
        page_views: pageviewEvents.length,
        total_clicks: clickEvents.length,
        total_scrolls: scrollEvents.length,
        pages_visited: pagesVisited
      }

      // Add ended_at only if session duration indicates it's ending
      if (duration && duration > 0) {
        const sessionDataWithEndTime = {
          ...sessionData,
          ended_at: new Date().toISOString()
        }
        const success = await updateSession(session.id, sessionDataWithEndTime)
        return NextResponse.json({ success, session_id })
      } else {
        const success = await updateSession(session.id, sessionData)
        return NextResponse.json({ success, session_id })
      }
    } else {
      // Create new session
      const newSession = await createSession({
        session_id,
        website_domain,
        user_agent: user_agent || 'Unknown'
      })
      
      if (newSession) {
        return NextResponse.json({ success: true, session_id })
      } else {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create session'
        }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Error handling session:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process session data'
    }, { status: 500 })
  }
}