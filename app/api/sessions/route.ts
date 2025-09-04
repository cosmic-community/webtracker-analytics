import { NextRequest, NextResponse } from 'next/server'
import { cosmic, createSession, updateSession, getSessions } from '@/lib/cosmic'
import type { TrackingEvent } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const sessionId = searchParams.get('sessionId')
    
    if (sessionId) {
      // Get specific session
      try {
        const response = await cosmic.objects.findOne({
          type: 'tracking-sessions',
          'metadata.session_id': sessionId
        }).depth(1)
        
        if (response.object) {
          return NextResponse.json({ session: response.object })
        } else {
          return NextResponse.json({ 
            session: null,
            error: 'Session not found'
          }, { status: 404 })
        }
      } catch (error) {
        console.error('Error fetching specific session:', error)
        return NextResponse.json({ 
          session: null,
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
    const { session_id, website_domain, user_agent, events } = body

    if (!session_id || !website_domain) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: session_id and website_domain are required'
      }, { status: 400 })
    }

    // Check if session already exists
    let existingSession = null
    try {
      const response = await cosmic.objects.find({
        type: 'tracking-sessions',
        'metadata.session_id': session_id
      }).depth(1)
      
      if (response.objects && response.objects.length > 0) {
        existingSession = response.objects[0]
      }
    } catch (error) {
      // Session doesn't exist yet
      console.log('Session not found, will create new one')
    }

    if (existingSession) {
      // Update existing session
      const currentEvents = Array.isArray(existingSession.metadata.events) 
        ? existingSession.metadata.events 
        : []
      
      // Parse events if it's a JSON string
      let parsedCurrentEvents = currentEvents
      if (typeof currentEvents === 'string') {
        try {
          parsedCurrentEvents = JSON.parse(currentEvents)
        } catch (error) {
          parsedCurrentEvents = []
        }
      }

      const newEvents = Array.isArray(events) ? events : []
      const allEvents = [...parsedCurrentEvents, ...newEvents]
      
      // Calculate pages visited from events
      const pageviews = allEvents.filter(e => e.type === 'pageview')
      const uniquePages = [...new Set(pageviews.map(e => e.url))]
      
      // Calculate stats
      const clickEvents = allEvents.filter(e => e.type === 'click')
      const scrollEvents = allEvents.filter(e => e.type === 'scroll')
      
      const updateData = {
        events: allEvents,
        page_views: pageviews.length,
        pages_visited: uniquePages,
        total_clicks: clickEvents.length,
        total_scrolls: scrollEvents.length,
        duration: allEvents.length > 0 
          ? Math.max(...allEvents.map(e => e.timestamp)) - Math.min(...allEvents.map(e => e.timestamp))
          : 0,
        ended_at: new Date().toISOString()
      }

      const success = await updateSession(existingSession.id, updateData)
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          action: 'updated',
          sessionId: existingSession.id
        })
      } else {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to update session'
        }, { status: 500 })
      }
    } else {
      // Create new session
      const eventsArray = Array.isArray(events) ? events : []
      const pageviews = eventsArray.filter(e => e.type === 'pageview')
      const uniquePages = pageviews.length > 0 
        ? [...new Set(pageviews.map(e => e.url))] 
        : ['/']
      
      const clickEvents = eventsArray.filter(e => e.type === 'click')
      const scrollEvents = eventsArray.filter(e => e.type === 'scroll')

      const sessionData = {
        session_id,
        website_domain,
        user_agent: user_agent || 'Unknown'
      }

      const session = await createSession(sessionData)
      
      if (session) {
        // Update with events data
        const updateData = {
          events: eventsArray,
          page_views: pageviews.length || 1,
          pages_visited: uniquePages,
          total_clicks: clickEvents.length,
          total_scrolls: scrollEvents.length,
          duration: eventsArray.length > 0 
            ? Math.max(...eventsArray.map(e => e.timestamp)) - Math.min(...eventsArray.map(e => e.timestamp))
            : 0
        }

        await updateSession(session.id, updateData)
        
        return NextResponse.json({ 
          success: true, 
          action: 'created',
          sessionId: session.id
        })
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