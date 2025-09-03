import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import type { TrackingEvent } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const sessions = await cosmic.objects
      .find({ type: 'tracking-sessions' })
      .props(['id', 'title', 'metadata', 'created_at'])
      .depth(1)

    const sortedSessions = sessions.objects.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      sessions: sortedSessions.slice(0, limit),
      total: sessions.objects.length
    })
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
    const { action } = body

    if (action === 'create') {
      const { session_id, website_domain, user_agent } = body
      
      const response = await cosmic.objects.insertOne({
        type: 'tracking-sessions',
        title: `Session ${session_id}`,
        metadata: {
          session_id,
          website_domain,
          duration: 0,
          page_views: 1,
          events: [],
          user_agent,
          started_at: new Date().toISOString(),
          total_clicks: 0,
          total_scrolls: 0,
          pages_visited: ['/']
        }
      })

      return NextResponse.json({ 
        success: true,
        session: response.object
      })
    }

    if (action === 'update') {
      const { session_id, events, duration, page_views, total_clicks, total_scrolls, pages_visited, ended_at } = body
      
      // Find session by session_id
      const sessions = await cosmic.objects.find({
        type: 'tracking-sessions',
        'metadata.session_id': session_id
      })

      if (sessions.objects.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Session not found' 
        }, { status: 404 })
      }

      const sessionObject = sessions.objects[0]
      const updateData: any = {}

      if (events) updateData.events = events
      if (duration !== undefined) updateData.duration = duration
      if (page_views !== undefined) updateData.page_views = page_views
      if (total_clicks !== undefined) updateData.total_clicks = total_clicks
      if (total_scrolls !== undefined) updateData.total_scrolls = total_scrolls
      if (pages_visited) updateData.pages_visited = pages_visited
      if (ended_at) updateData.ended_at = ended_at

      await cosmic.objects.updateOne(sessionObject.id, {
        metadata: updateData
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('Error handling session request:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process session request'
    }, { status: 500 })
  }
}