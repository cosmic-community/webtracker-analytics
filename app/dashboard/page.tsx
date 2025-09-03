import Link from 'next/link'
import { BarChart3, Play, MousePointer, Users, Clock, Eye, TrendingUp, ArrowRight } from 'lucide-react'
import StatsCards from '@/components/StatsCards'
import RecentSessions from '@/components/RecentSessions'
import HeatmapPreview from '@/components/HeatmapPreview'

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitor user behavior and session activity
              </p>
            </div>
            <nav className="flex items-center gap-4">
              <Link 
                href="/sessions" 
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Sessions
              </Link>
              <Link 
                href="/heatmaps" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <MousePointer className="w-4 h-4" />
                Heatmaps
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Overview Stats
          </h2>
          <StatsCards />
        </section>

        {/* Quick Actions */}
        <section className="grid md:grid-cols-3 gap-6">
          <Link 
            href="/sessions"
            className="stat-card hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Session Recordings</h3>
                <p className="text-muted-foreground text-sm">
                  Watch real user interactions and behavior patterns
                </p>
              </div>
              <div className="text-primary group-hover:translate-x-1 transition-transform">
                <Play className="w-8 h-8" />
              </div>
            </div>
          </Link>

          <Link 
            href="/heatmaps"
            className="stat-card hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Heatmap Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Visualize click patterns and user hotspots
                </p>
              </div>
              <div className="text-primary group-hover:translate-x-1 transition-transform">
                <MousePointer className="w-8 h-8" />
              </div>
            </div>
          </Link>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Real-time Tracking</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor live user activity and sessions
                </p>
              </div>
              <div className="text-green-500">
                <div className="relative">
                  <Eye className="w-8 h-8" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sessions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Recent Sessions
            </h2>
            <Link 
              href="/sessions" 
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm"
            >
              View all sessions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <RecentSessions limit={5} />
        </section>

        {/* Heatmap Preview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MousePointer className="w-6 h-6 text-primary" />
              Heatmap Preview
            </h2>
            <Link 
              href="/heatmaps" 
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm"
            >
              View all heatmaps
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <HeatmapPreview />
        </section>

        {/* Activity Summary */}
        <section className="stat-card">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Today's Activity
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                <span className="loading-shimmer">--</span>
              </div>
              <div className="text-sm text-muted-foreground">New Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-1">
                <span className="loading-shimmer">--</span>
              </div>
              <div className="text-sm text-muted-foreground">Page Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">
                <span className="loading-shimmer">--</span>
              </div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-1">
                <span className="loading-shimmer">--</span>
              </div>
              <div className="text-sm text-muted-foreground">Avg. Duration</div>
            </div>
          </div>
        </section>

        {/* Demo Notice */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Live Tracking Active</h3>
              <p className="text-sm text-muted-foreground">
                This dashboard shows real data from your interactions with this website. 
                All mouse movements, clicks, and scrolls are being recorded and stored in 
                your Cosmic CMS bucket. Check the sessions and heatmaps pages to see your 
                own behavior data!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}