// app/sessions/[sessionId]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Clock, MousePointer, Eye } from 'lucide-react'
import SessionPlayer from '@/components/SessionPlayer'
import { getSession } from '@/lib/cosmic'
import type { TrackingSession } from '@/types'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionPlaybackPage({ params }: PageProps) {
  const { sessionId } = await params
  
  const session = await getSession(sessionId)
  
  if (!session) {
    notFound()
  }

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const getSessionStatus = (session: TrackingSession): { status: string; color: string } => {
    if (session.metadata.ended_at) {
      return { status: 'Completed', color: 'text-green-500' }
    }
    
    const startTime = new Date(session.metadata.started_at).getTime()
    const now = Date.now()
    const timeSinceStart = now - startTime
    
    // Consider session active if started within last 30 minutes and no end time
    if (timeSinceStart < 30 * 60 * 1000) {
      return { status: 'Active', color: 'text-blue-500' }
    }
    
    return { status: 'Abandoned', color: 'text-yellow-500' }
  }

  const sessionStatus = getSessionStatus(session)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/sessions"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sessions
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Play className="w-8 h-8 text-primary" />
                  Session Playback
                </h1>
                <p className="text-muted-foreground mt-1">
                  Watch user interactions and behavior patterns
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${sessionStatus.color}`}>
                {sessionStatus.status}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(session.metadata.started_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Session Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Duration</h3>
            <div className="text-2xl font-bold text-blue-500">
              {formatDuration(session.metadata.duration)}
            </div>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Page Views</h3>
            <div className="text-2xl font-bold text-green-500">
              {session.metadata.page_views}
            </div>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MousePointer className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Clicks</h3>
            <div className="text-2xl font-bold text-red-500">
              {session.metadata.total_clicks}
            </div>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Events</h3>
            <div className="text-2xl font-bold text-purple-500">
              {Array.isArray(session.metadata.events) ? session.metadata.events.length : 0}
            </div>
          </div>
        </div>

        {/* Session Player */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Session Recording
                </h2>
                <p className="text-muted-foreground mt-1">
                  Interactive playback of user behavior
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Session ID: <code className="bg-muted px-2 py-1 rounded">{session.metadata.session_id}</code>
              </div>
            </div>
          </div>
          
          <SessionPlayer session={session} />
        </div>

        {/* Session Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Session Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Session Timeline</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Array.isArray(session.metadata.events) && session.metadata.events.length > 0 ? (
                session.metadata.events
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .slice(0, 20) // Show first 20 events
                  .map((event, index) => (
                    <div key={event.id || index} className="flex items-center gap-3 pb-3 border-b border-border last:border-b-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {event.type === 'click' && <MousePointer className="w-4 h-4 text-red-500" />}
                        {event.type === 'scroll' && <Eye className="w-4 h-4 text-blue-500" />}
                        {event.type === 'mousemove' && <MousePointer className="w-4 h-4 text-green-500" />}
                        {event.type === 'pageview' && <Eye className="w-4 h-4 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium capitalize">
                          {event.type}
                          {event.type === 'click' && event.element && (
                            <span className="text-muted-foreground font-normal ml-2">
                              on {event.element.split(' > ').pop() || 'element'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.metadata.started_at).getTime() + (event.timestamp - (session.metadata.events?.[0]?.timestamp || 0)) > 0
                            ? new Date(new Date(session.metadata.started_at).getTime() + (event.timestamp - (session.metadata.events?.[0]?.timestamp || 0))).toLocaleTimeString()
                            : new Date(event.timestamp).toLocaleTimeString()
                          }
                          {event.url && (
                            <span className="ml-2">• {new URL(event.url).pathname}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No events recorded in this session</p>
                </div>
              )}
            </div>
            {Array.isArray(session.metadata.events) && session.metadata.events.length > 20 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing first 20 of {session.metadata.events.length} events
                </p>
              </div>
            )}
          </div>

          {/* Session Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Session Information</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">User Agent</div>
                <div className="text-sm bg-muted p-2 rounded font-mono">
                  {session.metadata.user_agent || 'Unknown'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Domain</div>
                <div className="text-sm">{session.metadata.website_domain}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Started At</div>
                <div className="text-sm">
                  {new Date(session.metadata.started_at).toLocaleString()}
                </div>
              </div>

              {session.metadata.ended_at && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Ended At</div>
                  <div className="text-sm">
                    {new Date(session.metadata.ended_at).toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Pages Visited</div>
                <div className="space-y-1">
                  {Array.isArray(session.metadata.pages_visited) && session.metadata.pages_visited.length > 0 ? (
                    session.metadata.pages_visited.map((page, index) => (
                      <div key={index} className="text-sm bg-muted/50 px-2 py-1 rounded">
                        {page}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No pages recorded</div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-sm font-medium text-muted-foreground mb-2">Session Stats</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Scrolls:</span>
                    <span className="ml-2 font-medium">{session.metadata.total_scrolls}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-2 font-medium ${sessionStatus.color}`}>
                      {sessionStatus.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}