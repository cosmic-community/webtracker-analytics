import Link from 'next/link'
import { ArrowLeft, MousePointer, BarChart3, Target, Eye } from 'lucide-react'
import HeatmapViewer from '@/components/HeatmapViewer'

export default function HeatmapsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <MousePointer className="w-8 h-8 text-primary" />
                  Heatmap Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                  Visualize user interaction patterns and hotspots
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Live Heatmap Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Every click and mouse movement on this site is contributing to the heatmap data below. 
                The red areas show where users click most often, while the intensity represents 
                frequency. Your interactions are being added to this data in real-time!
              </p>
            </div>
          </div>
        </div>

        {/* Heatmap Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MousePointer className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Clicks</h3>
            <div className="text-3xl font-bold text-red-500">
              <span className="loading-shimmer">Loading...</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Across all pages
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Hotspots</h3>
            <div className="text-3xl font-bold text-blue-500">
              <span className="loading-shimmer">--</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              High-activity areas
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pages Tracked</h3>
            <div className="text-3xl font-bold text-green-500">
              <span className="loading-shimmer">--</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              With heatmap data
            </p>
          </div>
        </div>

        {/* Page Selection */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Page to View</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="text-left p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
              <div className="font-medium">Homepage</div>
              <div className="text-sm text-muted-foreground">/</div>
              <div className="text-xs text-primary mt-2">Most activity</div>
            </button>
            <button className="text-left p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 transition-colors">
              <div className="font-medium">Dashboard</div>
              <div className="text-sm text-muted-foreground">/dashboard</div>
              <div className="text-xs text-muted-foreground mt-2">View heatmap</div>
            </button>
            <button className="text-left p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 transition-colors">
              <div className="font-medium">Sessions</div>
              <div className="text-sm text-muted-foreground">/sessions</div>
              <div className="text-xs text-muted-foreground mt-2">View heatmap</div>
            </button>
            <button className="text-left p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 transition-colors">
              <div className="font-medium">Heatmaps</div>
              <div className="text-sm text-muted-foreground">/heatmaps</div>
              <div className="text-xs text-muted-foreground mt-2">Current page</div>
            </button>
          </div>
        </div>

        {/* Heatmap Viewer */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Homepage Heatmap
                </h2>
                <p className="text-muted-foreground mt-1">
                  Click patterns and user interaction hotspots
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500/60 rounded-full"></div>
                  <span>Mouse Movement</span>
                </div>
              </div>
            </div>
          </div>
          
          <HeatmapViewer pageUrl="/" />
        </div>

        {/* Heatmap Insights */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">High Click Activity</div>
                  <div className="text-sm text-muted-foreground">
                    Primary call-to-action buttons receive the most clicks
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Navigation Patterns</div>
                  <div className="text-sm text-muted-foreground">
                    Users frequently interact with the top navigation area
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Content Engagement</div>
                  <div className="text-sm text-muted-foreground">
                    Feature cards in the middle section attract mouse movement
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">How Heatmaps Work</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Click Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Every click is recorded with precise coordinates and aggregated 
                  to show interaction hotspots in red intensity gradients.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mouse Movement</h4>
                <p className="text-sm text-muted-foreground">
                  Mouse position is tracked to understand user attention patterns 
                  and areas of interest on each page.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Real-time Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Heatmap data is updated continuously as users interact with 
                  your site, providing fresh insights.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-card/50 border border-border rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Interactive Demo</h3>
              <p className="text-sm text-muted-foreground">
                Try clicking around this page and then refresh to see your clicks 
                added to the heatmap data! This is a fully functional demonstration 
                where your interactions contribute to the analytics shown above.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}