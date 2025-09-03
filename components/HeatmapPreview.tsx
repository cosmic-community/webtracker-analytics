'use client'

import { useEffect, useState } from 'react'
import { MousePointer, BarChart3, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { HeatmapData } from '@/types'

export default function HeatmapPreview() {
  const [heatmaps, setHeatmaps] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHeatmaps = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/heatmaps?limit=3')
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched heatmaps for preview:', data) // Debug log
          
          // Ensure we have an array
          const heatmapsArray = Array.isArray(data.heatmaps) ? data.heatmaps : []
          setHeatmaps(heatmapsArray)
        } else {
          console.error('Failed to fetch heatmaps:', response.status, response.statusText)
          setError(`Failed to fetch heatmaps: ${response.status}`)
          setHeatmaps([])
        }
      } catch (error) {
        console.error('Failed to fetch heatmaps:', error)
        setError('Network error while fetching heatmaps')
        setHeatmaps([])
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmaps()
  }, [])

  const getTotalClicks = (heatmap: HeatmapData): number => {
    const clickData = heatmap.metadata?.click_data
    if (!Array.isArray(clickData)) return 0
    return clickData.reduce((sum, point) => sum + (point.count || 0), 0)
  }

  const getHotspotCount = (heatmap: HeatmapData): number => {
    const clickData = heatmap.metadata?.click_data
    if (!Array.isArray(clickData)) return 0
    return clickData.filter(point => (point.count || 0) > 2).length // Lower threshold for demo
  }

  const formatPageTitle = (pageUrl: string): string => {
    switch (pageUrl) {
      case '/':
        return 'Homepage'
      case '/heatmaps':
        return 'Heatmaps Page'
      case '/sessions':
        return 'Sessions Page'
      case '/dashboard':
        return 'Dashboard'
      default:
        if (pageUrl.startsWith('/sessions/')) {
          return 'Session Details'
        }
        return pageUrl.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="stat-card">
            <div className="space-y-4">
              <div className="h-32 bg-secondary rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-secondary rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-red-200 rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-800">Error Loading Heatmaps</h3>
            <p className="text-red-600 max-w-md mx-auto">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (heatmaps.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No Heatmap Data Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Heatmap data will be generated as users interact with your website. 
              Continue browsing and clicking to create heatmap visualizations.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-primary">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Currently collecting interaction data
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {heatmaps.map((heatmap) => (
        <div key={heatmap.id} className="stat-card group hover:border-primary/50 transition-colors">
          {/* Heatmap Preview */}
          <div className="relative h-32 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg mb-4 overflow-hidden">
            {/* Simulated heatmap visualization */}
            <div className="absolute inset-0 opacity-80">
              {Array.isArray(heatmap.metadata?.click_data) && 
                heatmap.metadata.click_data.slice(0, 12).map((point, index) => {
                  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return null
                  
                  const intensity = Math.min((point.count || 0) / 5, 1) // Normalize for preview
                  const size = 8 + (intensity * 20)
                  
                  return (
                    <div
                      key={index}
                      className="absolute rounded-full"
                      style={{
                        left: `${Math.min((point.x || 0) / 1440 * 100, 85)}%`,
                        top: `${Math.min((point.y || 0) / 900 * 100, 75)}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        background: `radial-gradient(circle, rgba(255,0,0,${intensity * 0.9}) 0%, rgba(255,0,0,${intensity * 0.5}) 50%, transparent 100%)`
                      }}
                    />
                  )
                })
              }
            </div>
            
            {/* Page overlay */}
            <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
              {heatmap.metadata?.page_url || '/'}
            </div>
            
            {/* Data quality indicator */}
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Heatmap Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {formatPageTitle(heatmap.metadata?.page_url || '/')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {heatmap.metadata?.session_count || 0} session
                {(heatmap.metadata?.session_count || 0) !== 1 ? 's' : ''}
                {heatmap.metadata?.last_updated && (
                  <> • Last updated {new Date(heatmap.metadata.last_updated).toLocaleDateString()}</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 text-red-500 font-medium">
                  <MousePointer className="w-3 h-3" />
                  {getTotalClicks(heatmap)}
                </div>
                <div className="text-muted-foreground text-xs">Total Clicks</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-blue-500 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {getHotspotCount(heatmap)}
                </div>
                <div className="text-muted-foreground text-xs">Hotspots</div>
              </div>
            </div>

            <Link 
              href={`/heatmaps?page=${encodeURIComponent(heatmap.metadata?.page_url || '/')}`}
              className="block text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View Full Heatmap →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}