import { NextRequest, NextResponse } from 'next/server'
import { cosmic, getSessions, getSession, createSession, updateSession } from '@/lib/cosmic'
import type { TrackingEvent } from '@/types'

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
        return NextResponse.json({ 
          error: 'Session not found' 
        }, { status: 404 })
      }
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
    const { session_id, website_domain, user_agent, events, duration, page_views } = body

    console.log('Creating/updating session:', { session_id, website_domain, events_count: events?.length })

    if (!session_id || !website_domain) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing session_id or website_domain'
      }, { status: 400 })
    }

    // Check if session already exists
    let existingSession;
    try {
      const response = await cosmic.objects.find({
        type: 'tracking-sessions',
        'metadata.session_id': session_id
      }).depth(1);
      
      if (response.objects && response.objects.length > 0) {
        existingSession = response.objects[0];
      }
    } catch (error) {
      console.log('No existing session found, will create new one');
    }

    if (existingSession) {
      // Update existing session
      console.log('Updating existing session:', existingSession.id)
      
      // Merge new events with existing ones
      let allEvents: TrackingEvent[] = []
      if (existingSession.metadata?.events) {
        // Parse existing events
        if (typeof existingSession.metadata.events === 'string') {
          try {
            allEvents = JSON.parse(existingSession.metadata.events)
          } catch (e) {
            console.warn('Failed to parse existing events')
            allEvents = []
          }
        } else if (Array.isArray(existingSession.metadata.events)) {
          allEvents = existingSession.metadata.events
        }
      }
      
      // Add new events
      if (Array.isArray(events)) {
        allEvents = [...allEvents, ...events]
      }

      // Calculate stats
      const clickEvents = allEvents.filter(e => e.type === 'click')
      const scrollEvents = allEvents.filter(e => e.type === 'scroll')
      const pageviews = allEvents.filter(e => e.type === 'pageview')
      
      // Get unique pages visited
      const pagesVisited = Array.from(new Set(allEvents.map(e => e.url).filter(Boolean)))

      const updateSuccess = await updateSession(existingSession.id, {
        events: allEvents,
        duration: duration || existingSession.metadata.duration || 0,
        page_views: pageviews.length || existingSession.metadata.page_views || 1,
        total_clicks: clickEvents.length,
        total_scrolls: scrollEvents.length,
        pages_visited: pagesVisited,
        ended_at: new Date().toISOString()
      })

      if (updateSuccess) {
        console.log('Session updated successfully')
        return NextResponse.json({ success: true, session_id })
      } else {
        console.error('Failed to update session')
        return NextResponse.json({ 
          success: false,
          error: 'Failed to update session'
        }, { status: 500 })
      }
    } else {
      // Create new session
      console.log('Creating new session')
      
      const clickEvents = Array.isArray(events) ? events.filter(e => e.type === 'click') : []
      const scrollEvents = Array.isArray(events) ? events.filter(e => e.type === 'scroll') : []
      const pageviews = Array.isArray(events) ? events.filter(e => e.type === 'pageview') : []
      
      // Get unique pages visited
      const pagesVisited = Array.isArray(events) 
        ? Array.from(new Set(events.map(e => e.url).filter(Boolean)))
        : ['/']

      const newSession = await createSession({
        session_id,
        website_domain,
        user_agent: user_agent || 'Unknown'
      })

      if (newSession) {
        // Immediately update with event data
        const updateSuccess = await updateSession(newSession.id, {
          events: Array.isArray(events) ? events : [],
          duration: duration || 0,
          page_views: pageviews.length || 1,
          total_clicks: clickEvents.length,
          total_scrolls: scrollEvents.length,
          pages_visited: pagesVisited
        })

        if (updateSuccess) {
          console.log('New session created and updated successfully')
          return NextResponse.json({ success: true, session_id })
        } else {
          console.error('Created session but failed to update with events')
          return NextResponse.json({ success: true, session_id, warning: 'Events not saved' })
        }
      } else {
        console.error('Failed to create session')
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create session'
        }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Error in sessions API:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Server error while processing session'
    }, { status: 500 })
  }
}