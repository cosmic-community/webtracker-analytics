import { NextRequest, NextResponse } from 'next/server'
import { cosmic, createSession, updateSession, getSessions, getSession } from '@/lib/cosmic'
import type { TrackingEvent } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (sessionId) {
      // Get single session
      const session = await getSession(sessionId)
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      return NextResponse.json({ session })
    } else {
      // Get all sessions
      const sessions = await getSessions(limit)
      return NextResponse.json({ 
        sessions,
        total: sessions.length 
      })
    }
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, session_id, events, website_domain, user_agent, started_at, duration, ended_at } = body

    if (!action || !session_id) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing action or session_id'
      }, { status: 400 })
    }

    if (action === 'create') {
      // Create new session
      if (!website_domain || !user_agent) {
        return NextResponse.json({ 
          success: false,
          error: 'Missing required fields for session creation'
        }, { status: 400 })
      }

      const session = await createSession({
        session_id,
        website_domain,
        user_agent
      })

      if (session) {
        console.log('✅ Session created:', session_id)
        return NextResponse.json({ 
          success: true,
          session_id: session.metadata.session_id
        })
      } else {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create session'
        }, { status: 500 })
      }
    }

    if (action === 'update') {
      // Update session with events
      if (!events || !Array.isArray(events)) {
        return NextResponse.json({ 
          success: false,
          error: 'Events array is required'
        }, { status: 400 })
      }

      // Find existing session by session_id
      const sessions = await getSessions(100)
      const existingSession = sessions.find(s => s.metadata.session_id === session_id)
      
      if (!existingSession) {
        return NextResponse.json({ 
          success: false,
          error: 'Session not found'
        }, { status: 404 })
      }

      // Merge events with existing ones
      const existingEvents = existingSession.metadata.events || []
      const allEvents = [...existingEvents, ...events]

      // Calculate statistics
      const clickEvents = allEvents.filter(e => e.type === 'click')
      const scrollEvents = allEvents.filter(e => e.type === 'scroll')
      const pageviewEvents = allEvents.filter(e => e.type === 'pageview')
      
      // Get unique pages visited
      const pagesVisited = Array.from(new Set([
        ...pageviewEvents.map(e => new URL(e.url).pathname),
        ...(existingSession.metadata.pages_visited || [])
      ]))

      const sessionDuration = duration || (Date.now() - new Date(existingSession.metadata.started_at).getTime())

      const updates = {
        events: allEvents,
        duration: sessionDuration,
        page_views: pageviewEvents.length,
        total_clicks: clickEvents.length,
        total_scrolls: scrollEvents.length,
        pages_visited: pagesVisited
      }

      if (ended_at) {
        updates.ended_at = ended_at
      }

      const success = await updateSession(existingSession.id, updates)

      if (success) {
        console.log('✅ Session updated:', session_id, 'with', events.length, 'new events')
        return NextResponse.json({ 
          success: true,
          events_added: events.length,
          total_events: allEvents.length
        })
      } else {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to update session'
        }, { status: 500 })
      }
    }

    if (action === 'update_session') {
      // Update session metadata only
      const sessions = await getSessions(100)
      const existingSession = sessions.find(s => s.metadata.session_id === session_id)
      
      if (!existingSession) {
        return NextResponse.json({ 
          success: false,
          error: 'Session not found'
        }, { status: 404 })
      }

      const updates: any = {}
      if (duration !== undefined) updates.duration = duration
      if (ended_at) updates.ended_at = ended_at

      const success = await updateSession(existingSession.id, updates)

      return NextResponse.json({ success })
    }

    return NextResponse.json({ 
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Error handling session request:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}