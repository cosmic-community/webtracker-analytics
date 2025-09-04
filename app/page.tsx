import Link from 'next/link'
import { MousePointer, BarChart3, Activity, Target, Users, TrendingUp, ExternalLink, PlayCircle } from 'lucide-react'
import StatsCards from '@/components/StatsCards'
import RecentSessions from '@/components/RecentSessions'
import HeatmapPreview from '@/components/HeatmapPreview'
import RecentActivity from '@/components/RecentActivity'
import CosmicBadge from '@/components/CosmicBadge'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Activity className="w-10 h-10 text-primary" />
                WebTracker Analytics
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Real-time user behavior tracking and heatmap analytics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="btn-primary"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Demo Website Section - NEW */}
        <section className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 border border-primary/20 rounded-xl p-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <PlayCircle className="w-4 h-4" />
              Live Demo Available
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Try the Live Demo Website</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience WebTracker in action! Browse our demo website and watch your interactions 
                appear in real-time in the sessions and heatmap analytics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/test-site"
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                <ExternalLink className="w-5 h-5" />
                Visit Demo Website
              </Link>
              <div className="text-sm text-muted-foreground">
                Then check your activity in the{' '}
                <Link href="/sessions" className="text-primary hover:underline font-medium">
                  Sessions
                </Link>
                {' '}and{' '}
                <Link href="/heatmaps" className="text-primary hover:underline font-medium">
                  Heatmaps
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                <MousePointer className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-medium">Click Tracking</div>
                <div className="text-sm text-muted-foreground">Every click recorded</div>
              </div>
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="font-medium">Mouse Movement</div>
                <div className="text-sm text-muted-foreground">Hover patterns tracked</div>
              </div>
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-medium">Page Views</div>
                <div className="text-sm text-muted-foreground">Navigation recorded</div>
              </div>
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="font-medium">Scroll Tracking</div>
                <div className="text-sm text-muted-foreground">Engagement depth</div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Overview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics Overview</h2>
              <p className="text-muted-foreground">
                Real-time insights from your website tracking
              </p>
            </div>
            <Link 
              href="/dashboard"
              className="btn-secondary"
            >
              Full Dashboard
            </Link>
          </div>
          
          <StatsCards />
        </section>

        {/* Recent Sessions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Recent Sessions
              </h2>
              <p className="text-muted-foreground">
                Latest user sessions and activity
              </p>
            </div>
            <Link 
              href="/sessions"
              className="btn-secondary"
            >
              View All Sessions
            </Link>
          </div>
          
          <RecentSessions />
        </section>

        {/* Heatmap Preview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Heatmap Data
              </h2>
              <p className="text-muted-foreground">
                User interaction patterns and hotspots
              </p>
            </div>
            <Link 
              href="/heatmaps"
              className="btn-secondary"
            >
              View All Heatmaps
            </Link>
          </div>
          
          <HeatmapPreview />
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Recent Activity
              </h2>
              <p className="text-muted-foreground">
                Latest tracking events and updates
              </p>
            </div>
          </div>
          
          <RecentActivity />
        </section>

        {/* How It Works */}
        <section className="bg-card/50 border border-border rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">How WebTracker Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              WebTracker provides comprehensive analytics by tracking user behavior across your website
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                <MousePointer className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">Track Interactions</h3>
              <p className="text-muted-foreground">
                Capture every click, scroll, and mouse movement with precise coordinate tracking
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Generate Insights</h3>
              <p className="text-muted-foreground">
                Transform raw interaction data into actionable heatmaps and session analytics
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold">Optimize Experience</h3>
              <p className="text-muted-foreground">
                Use behavioral data to improve user experience and conversion rates
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-xl p-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Ready to Track Your Website?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start understanding your users better with comprehensive analytics and heatmap tracking
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/test-site"
                className="btn-primary inline-flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Try Demo First
              </Link>
              <Link 
                href="/dashboard"
                className="btn-secondary"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <CosmicBadge bucketSlug={process.env.COSMIC_BUCKET_SLUG as string} />
    </div>
  )
}