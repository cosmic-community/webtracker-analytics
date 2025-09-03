import Link from 'next/link'
import { BarChart3, MousePointer, Clock, Users, TrendingUp, Eye, ExternalLink } from 'lucide-react'
import StatsCards from '@/components/StatsCards'
import RecentSessions from '@/components/RecentSessions'
import HeatmapPreview from '@/components/HeatmapPreview'
import RecentActivity from '@/components/RecentActivity'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-primary" />
                WebTracker Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time user behavior analytics and heatmaps
              </p>
            </div>
            <nav className="flex items-center gap-4">
              <Link 
                href="/test-site"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Test Website
              </Link>
              <Link 
                href="/heatmaps"
                className="btn-primary inline-flex items-center gap-2"
              >
                <MousePointer className="w-4 h-4" />
                Heatmaps
              </Link>
              <Link 
                href="/sessions"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Sessions
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Interactive Demo Available</h3>
              <p className="text-blue-700 text-sm mb-4">
                Want to see the tracking in action? Visit our test website where every click, scroll, 
                and interaction is captured and displayed in this dashboard in real-time.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href="/test-site"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Test Website
                </Link>
                <div className="text-xs text-blue-600">
                  Generate real tracking data by interacting with the test site!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Analytics Overview</h2>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          <StatsCards />
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Recent Sessions */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Sessions
                </h2>
                <Link 
                  href="/sessions" 
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View all sessions →
                </Link>
              </div>
              <RecentSessions />
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Activity Feed
                </h2>
              </div>
              <RecentActivity />
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Heatmap Preview */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MousePointer className="w-5 h-5 text-primary" />
                  Heatmap Overview
                </h2>
                <Link 
                  href="/heatmaps" 
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View all heatmaps →
                </Link>
              </div>
              <HeatmapPreview />
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <Link 
                  href="/test-site"
                  className="block p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-primary transition-colors">
                        Test Website
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Visit the demo site to generate tracking data
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </Link>

                <Link 
                  href="/heatmaps"
                  className="block p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <MousePointer className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-primary transition-colors">
                        View Heatmaps
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Analyze click patterns and hotspots
                      </div>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/sessions"
                  className="block p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-primary transition-colors">
                        Session Recordings
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Replay user interactions step by step
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-12 bg-card/50 border border-border rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Live Demo Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                This dashboard shows real analytics data from the test website. Visit the{' '}
                <Link href="/test-site" className="text-primary hover:underline font-medium">
                  test website
                </Link>
                {' '}to interact with tracked elements and see your data appear here in real-time. 
                All tracking data is automatically collected and processed to demonstrate the analytics capabilities.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}