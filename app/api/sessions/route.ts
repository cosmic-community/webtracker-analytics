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
      const session = await cosmic.objects.findOne({
        type: 'tracking-sessions',
        id: sessionId
      }).depth(1);
      
      if (session) {
        return NextResponse.json({ session: session.object })
      } else {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
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
    const { session_id, action, events, website_domain, user_agent, page_url, referrer, duration } = body

    if (!session_id) {
      return NextResponse.json({ 
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    if (action === 'start') {
      // Create new session
      const session = await createSession({
        session_id,
        website_domain: website_domain || 'localhost:3000',
        user_agent: user_agent || 'Unknown'
      })

      if (session) {
        return NextResponse.json({ 
          success: true,
          session_id: session_id
        })
      } else {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create session'
        }, { status: 500 })
      }
    } else if (action === 'end') {
      // End session
      try {
        const existingSession = await cosmic.objects.find({
          type: 'tracking-sessions',
          'metadata.session_id': session_id
        }).depth(1);

        if (existingSession.objects && existingSession.objects.length > 0) {
          const session = existingSession.objects[0]
          
          const success = await updateSession(session.id, {
            ended_at: new Date().toISOString(),
            duration: duration || 0
          })

          return NextResponse.json({ success })
        } else {
          return NextResponse.json({ 
            success: false,
            error: 'Session not found'
          }, { status: 404 })
        }
      } catch (error) {
        console.error('Error ending session:', error)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to end session'
        }, { status: 500 })
      }
    } else if (events && Array.isArray(events)) {
      // Update session with new events
      try {
        const existingSession = await cosmic.objects.find({
          type: 'tracking-sessions',
          'metadata.session_id': session_id
        }).depth(1);

        if (existingSession.objects && existingSession.objects.length > 0) {
          const session = existingSession.objects[0]
          const currentEvents = session.metadata.events || []
          const newEvents = [...currentEvents, ...events]
          
          // Calculate stats
          const clickEvents = newEvents.filter((e: TrackingEvent) => e.type === 'click')
          const scrollEvents = newEvents.filter((e: TrackingEvent) => e.type === 'scroll')
          const pageviews = newEvents.filter((e: TrackingEvent) => e.type === 'pageview')
          
          // Get unique pages visited
          const pagesVisited = [...new Set(newEvents
            .filter((e: TrackingEvent) => e.type === 'pageview')
            .map((e: TrackingEvent) => new URL(e.url).pathname)
          )]

          const success = await updateSession(session.id, {
            events: newEvents,
            total_clicks: clickEvents.length,
            total_scrolls: scrollEvents.length,
            page_views: pageviews.length,
            pages_visited: pagesVisited,
            duration: Date.now() - new Date(session.metadata.started_at).getTime()
          })

          // Update heatmap data if we have position events
          const positionEvents = events.filter((e: TrackingEvent) => 
            (e.type === 'click' || e.type === 'mousemove') && e.x !== undefined && e.y !== undefined
          )

          if (positionEvents.length > 0 && success) {
            // Update heatmap data
            await fetch(`${request.nextUrl.origin}/api/heatmaps`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                website_domain: website_domain || 'localhost:3000',
                page_url: new URL(events[0]?.url || '/').pathname,
                events: positionEvents
              })
            })
          }

          return NextResponse.json({ success })
        } else {
          return NextResponse.json({ 
            success: false,
            error: 'Session not found'
          }, { status: 404 })
        }
      } catch (error) {
        console.error('Error updating session:', error)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to update session'
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: false,
      error: 'Invalid action or missing data'
    }, { status: 400 })
  } catch (error) {
    console.error('Error processing session request:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}