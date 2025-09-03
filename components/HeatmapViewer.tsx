'use client'

import { useEffect, useState, useRef } from 'react'
import type { HeatmapData, HeatPoint } from '@/types'

interface HeatmapViewerProps {
  pageUrl: string
  showMouse?: boolean
  showClicks?: boolean
}

export default function HeatmapViewer({ 
  pageUrl, 
  showMouse = true, 
  showClicks = true 
}: HeatmapViewerProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const response = await fetch(`/api/heatmaps?pageUrl=${encodeURIComponent(pageUrl)}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.heatmaps) && data.heatmaps.length > 0) {
            setHeatmapData(data.heatmaps[0])
          } else {
            setHeatmapData(null)
          }
        } else {
          console.error('Failed to fetch heatmap data:', response.status)
          setHeatmapData(null)
        }
      } catch (error) {
        console.error('Failed to fetch heatmap data:', error)
        setHeatmapData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [pageUrl])

  useEffect(() => {
    if (heatmapData && canvasRef.current && containerRef.current) {
      drawHeatmap()
    }
  }, [heatmapData, showMouse, showClicks])

  const drawHeatmap = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !heatmapData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height * 2 // Make it taller for demo

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw click heatmap
    if (showClicks && heatmapData.metadata?.click_data && Array.isArray(heatmapData.metadata.click_data)) {
      drawHeatPoints(ctx, heatmapData.metadata.click_data, 'rgba(255, 0, 0, 0.6)', canvas.width, canvas.height)
    }

    // Draw mouse movement heatmap
    if (showMouse && heatmapData.metadata?.mouse_data && Array.isArray(heatmapData.metadata.mouse_data)) {
      drawHeatPoints(ctx, heatmapData.metadata.mouse_data, 'rgba(0, 255, 0, 0.3)', canvas.width, canvas.height)
    }
  }

  const drawHeatPoints = (
    ctx: CanvasRenderingContext2D, 
    points: HeatPoint[], 
    color: string,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!Array.isArray(points) || points.length === 0) return

    // Find max count for normalization
    const maxCount = Math.max(...points.map(p => p.count || 0))
    if (maxCount === 0) return

    points.forEach(point => {
      const intensity = Math.min((point.count || 0) / maxCount, 1)
      const radius = 20 + (intensity * 30) // Radius based on intensity
      
      // Scale coordinates to canvas size
      const x = ((point.x || 0) / 1920) * canvasWidth // Assume 1920px base width
      const y = ((point.y || 0) / 1080) * canvasHeight // Assume 1080px base height

      // Create radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, color.replace(/[\d\.]+\)$/g, `${intensity * 0.8})`))
      gradient.addColorStop(0.5, color.replace(/[\d\.]+\)$/g, `${intensity * 0.4})`))
      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  if (loading) {
    return (
      <div className="bg-muted/20 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="loading-shimmer w-16 h-16 rounded-full mx-auto"></div>
          <div>
            <div className="font-medium">Loading heatmap data...</div>
            <div className="text-sm text-muted-foreground mt-1">
              Analyzing user interaction patterns
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!heatmapData) {
    return (
      <div className="bg-muted/20 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">No Heatmap Data Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Heatmap data will appear here as users interact with the page "{pageUrl}". 
              Keep browsing and interacting with the site to generate heatmap data!
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

  const getTotalClicks = (heatmapData: HeatmapData): number => {
    const clickData = heatmapData.metadata?.click_data
    if (!Array.isArray(clickData)) return 0
    return clickData.reduce((sum, point) => sum + (point.count || 0), 0)
  }

  return (
    <div className="relative">
      {/* Heatmap Controls */}
      <div className="absolute top-4 right-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium">Heatmap Layers</div>
        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={showClicks}
            onChange={(e) => setHeatmapData(prev => prev ? {...prev} : null)} // Trigger re-render
            className="rounded border-border"
          />
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          Click Heatmap
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={showMouse}
            onChange={(e) => setHeatmapData(prev => prev ? {...prev} : null)} // Trigger re-render
            className="rounded border-border"
          />
          <div className="w-3 h-3 bg-green-500/60 rounded-full"></div>
          Mouse Movement
        </label>
      </div>

      {/* Heatmap Canvas Container */}
      <div 
        ref={containerRef}
        className="relative bg-white rounded-lg border border-border overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        />
        
        {/* Sample webpage content for demonstration */}
        <div className="p-8 space-y-8 text-gray-900">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Sample Webpage</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              This represents the content of your webpage with heatmap overlay showing user interactions.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium">
                Primary CTA
              </button>
              <button className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium">
                Secondary CTA
              </button>
            </div>
          </header>

          <section className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Feature 1</h3>
              <p className="text-gray-600">
                Description of the first feature that users might interact with.
              </p>
              <button className="mt-4 text-blue-500 font-medium">Learn More →</button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Feature 2</h3>
              <p className="text-gray-600">
                Description of the second feature with interactive elements.
              </p>
              <button className="mt-4 text-blue-500 font-medium">Learn More →</button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Feature 3</h3>
              <p className="text-gray-600">
                Description of the third feature that attracts user attention.
              </p>
              <button className="mt-4 text-blue-500 font-medium">Learn More →</button>
            </div>
          </section>

          <section className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Call to Action Section</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              This section typically receives high interaction and would show hotspots in the heatmap.
            </p>
            <button className="bg-green-500 text-white px-8 py-4 rounded-lg font-medium text-lg">
              Get Started Now
            </button>
          </section>
        </div>
      </div>

      {/* Heatmap Statistics */}
      <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-medium">Total Clicks</div>
          <div className="text-2xl font-bold text-red-500 mt-1">
            {getTotalClicks(heatmapData)}
          </div>
          <div className="text-muted-foreground">On this page</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-medium">Sessions</div>
          <div className="text-2xl font-bold text-blue-500 mt-1">
            {heatmapData.metadata?.session_count || 0}
          </div>
          <div className="text-muted-foreground">Contributing to data</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-medium">Last Updated</div>
          <div className="text-2xl font-bold text-green-500 mt-1">
            {heatmapData.metadata?.last_updated 
              ? new Date(heatmapData.metadata.last_updated).toLocaleDateString()
              : 'Never'
            }
          </div>
          <div className="text-muted-foreground">Data freshness</div>
        </div>
      </div>
    </div>
  )
}