import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  try {
    const { confirm } = await request.json()
    
    if (!confirm) {
      return NextResponse.json({ 
        success: false,
        error: 'Confirmation required'
      }, { status: 400 })
    }

    const results = {
      sessionsDeleted: 0,
      heatmapsDeleted: 0,
      errors: [] as string[]
    }

    try {
      // Get all tracking sessions
      const sessionsResponse = await cosmic.objects
        .find({ type: 'tracking-sessions' })
        .props(['id'])
        .depth(0)

      if (sessionsResponse.objects && Array.isArray(sessionsResponse.objects)) {
        for (const session of sessionsResponse.objects) {
          try {
            await cosmic.objects.deleteOne(session.id)
            results.sessionsDeleted++
          } catch (error) {
            console.error('Error deleting session:', session.id, error)
            results.errors.push(`Failed to delete session ${session.id}`)
          }
        }
      }
    } catch (error) {
      console.log('No sessions found or error fetching sessions:', error)
    }

    try {
      // Get all heatmap data
      const heatmapsResponse = await cosmic.objects
        .find({ type: 'heatmap-data' })
        .props(['id'])
        .depth(0)

      if (heatmapsResponse.objects && Array.isArray(heatmapsResponse.objects)) {
        for (const heatmap of heatmapsResponse.objects) {
          try {
            await cosmic.objects.deleteOne(heatmap.id)
            results.heatmapsDeleted++
          } catch (error) {
            console.error('Error deleting heatmap:', heatmap.id, error)
            results.errors.push(`Failed to delete heatmap ${heatmap.id}`)
          }
        }
      }
    } catch (error) {
      console.log('No heatmaps found or error fetching heatmaps:', error)
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${results.sessionsDeleted} sessions and ${results.heatmapsDeleted} heatmaps`,
      details: results
    })

  } catch (error) {
    console.error('Error clearing sample data:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to clear sample data'
    }, { status: 500 })
  }
}