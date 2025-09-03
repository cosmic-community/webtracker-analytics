'use client'

import { useEffect, useState } from 'react'
import { Play, Clock, MousePointer, Eye, User, Monitor, Smartphone, Tablet } from 'lucide-react'
import type { TrackingSession } from '@/types'

interface SessionsListProps {
  limit?: number
}

export default function SessionsList({ limit = 20 }: SessionsListProps) {
  const [sessions, setSessions] = useState<TrackingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<TrackingSession | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/sessions?limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          setSessions(Array.isArray(data.sessions) ? data.sessions : [])
        } else {
          console.error('Failed to fetch sessions:', response.status)
          setSessions([])
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [limit])

  const formatDuration = (ms: number): string => {
    if (ms === 0) return '0s'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <Monitor className="w-4 h-4" />
    
    if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="w-4 h-4" />
    } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
      return <Tablet className="w-4 h-4" />
    }
    
    return <Monitor className="w-4 h-4" />
  }

  const getBrowserName = (userAgent: string): string => {
    if (!userAgent) return 'Unknown'
    
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    
    return 'Unknown'
  }

  const handleSessionClick = (session: TrackingSession) => {
    setSelectedSession(session)
  }

  const closeSessionDetails = () => {
    setSelectedSession(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded w-32"></div>
                  <div className="h-3 bg-secondary rounded w-48"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded w-16"></div>
                <div className="h-3 bg-secondary rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="stat-card text-center py-12">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No Sessions Recorded</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sessions will appear here as users interact with your website. 
          The tracking script is collecting data in real-time.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-green-500 mt-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Tracking is active
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {sessions.map((session) => {
          const isActive = !session.metadata.ended_at
          const duration = session.metadata.duration || 0
          const startTime = new Date(session.metadata.started_at)
          
          return (
            <div 
              key={session.id} 
              className="stat-card hover:border-primary/50 cursor-pointer transition-all group"
              onClick={() => handleSessionClick(session)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-green-500/20 text-green-500' : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    {isActive ? (
                      <div className="relative">
                        <Eye className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        Session {session.metadata.session_id.split('_')[1]?.slice(0, 8)}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {startTime.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        {getDeviceIcon(session.metadata.user_agent)}
                        {getBrowserName(session.metadata.user_agent)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">
                    {formatDuration(duration)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {session.metadata.page_views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3" />
                        {session.metadata.total_clicks || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress bar for active sessions */}
              {isActive && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Session in progress</span>
                    <span>{(session.metadata.events?.length || 0)} events</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((duration / (30 * 60 * 1000)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Session Details</h2>
                <button 
                  onClick={closeSessionDetails}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Session Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Session Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session ID:</span>
                      <span className="font-mono">{selectedSession.metadata.session_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span>{new Date(selectedSession.metadata.started_at).toLocaleString()}</span>
                    </div>
                    {selectedSession.metadata.ended_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ended:</span>
                        <span>{new Date(selectedSession.metadata.ended_at).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(selectedSession.metadata.duration || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Activity Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Page Views:</span>
                      <span>{selectedSession.metadata.page_views || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Clicks:</span>
                      <span>{selectedSession.metadata.total_clicks || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scroll Events:</span>
                      <span>{selectedSession.metadata.total_scrolls || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Events:</span>
                      <span>{selectedSession.metadata.events?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pages Visited */}
              {selectedSession.metadata.pages_visited && selectedSession.metadata.pages_visited.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Pages Visited</h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.metadata.pages_visited.map((page, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {page === '/' ? 'Homepage' : page}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Browser Information */}
              <div>
                <h3 className="font-medium mb-3">Browser Information</h3>
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {getDeviceIcon(selectedSession.metadata.user_agent)}
                    <span className="font-medium">
                      {getBrowserName(selectedSession.metadata.user_agent)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono bg-muted/30 p-2 rounded">
                    {selectedSession.metadata.user_agent}
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              {selectedSession.metadata.events && selectedSession.metadata.events.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Recent Events ({selectedSession.metadata.events.length})</h3>
                  <div className="bg-muted/20 rounded-lg max-h-48 overflow-y-auto">
                    <div className="space-y-1 p-4">
                      {selectedSession.metadata.events.slice(-10).reverse().map((event, index) => (
                        <div key={index} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              event.type === 'click' ? 'bg-red-500' :
                              event.type === 'mousemove' ? 'bg-green-500' :
                              event.type === 'scroll' ? 'bg-blue-500' :
                              event.type === 'pageview' ? 'bg-purple-500' :
                              'bg-gray-500'
                            }`}></span>
                            <span className="font-medium capitalize">{event.type}</span>
                            {event.element && (
                              <span className="text-muted-foreground">→ {event.element}</span>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}