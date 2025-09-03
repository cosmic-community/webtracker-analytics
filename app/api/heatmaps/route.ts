import { NextRequest, NextResponse } from 'next/server'
import { cosmic, updateHeatmapData, getHeatmapData } from '@/lib/cosmic'
import type { TrackingEvent } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageUrl = searchParams.get('pageUrl')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get all heatmaps or filter by pageUrl
    const heatmaps = await getHeatmapData('', pageUrl || undefined)

    return NextResponse.json({
      heatmaps: heatmaps.slice(0, limit),
      total: heatmaps.length
    })
  } catch (error) {
    console.error('Error fetching heatmaps:', error)
    return NextResponse.json({ 
      heatmaps: [],
      total: 0,
      error: 'Failed to fetch heatmaps'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { website_domain, page_url, events } = body

    if (!website_domain || !page_url || !events) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const success = await updateHeatmapData(website_domain, page_url, events)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update heatmap data'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating heatmap:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update heatmap data'
    }, { status: 500 })
  }
}