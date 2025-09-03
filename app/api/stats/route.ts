import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    // Fetch session data
    const sessions = await cosmic.objects.find({
      type: 'tracking-sessions'
    }).props(['id', 'metadata', 'created_at'])

    const sessionObjects = sessions.objects || []
    
    // Calculate statistics
    const totalSessions = sessionObjects.length
    const totalClicks = sessionObjects.reduce((sum: number, session: any) => {
      return sum + (session.metadata?.total_clicks || 0)
    }, 0)
    
    const durations = sessionObjects
      .filter((session: any) => session.metadata?.duration)
      .map((session: any) => session.metadata.duration)
    
    const averageDurationMs = durations.length > 0 
      ? durations.reduce((sum: number, duration: number) => sum + duration, 0) / durations.length
      : 0

    const averageDuration = formatDuration(averageDurationMs)

    // Active users (simplified - in reality you'd check recent activity)
    const activeNow = 1 // Current user

    return NextResponse.json({
      totalSessions,
      totalClicks,
      averageDuration,
      activeNow
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      totalSessions: 0,
      totalClicks: 0,
      averageDuration: '0:00',
      activeNow: 1,
      error: 'Failed to fetch statistics'
    }, { status: 500 })
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}