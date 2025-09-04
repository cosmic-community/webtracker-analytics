import Link from 'next/link'
import { BarChart3, Users, MousePointer, Activity, Settings } from 'lucide-react'
import StatsCards from '@/components/StatsCards'
import RecentSessions from '@/components/RecentSessions'
import RecentActivity from '@/components/RecentActivity'
import HeatmapPreview from '@/components/HeatmapPreview'
import ClearDataButton from '@/components/ClearDataButton'

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
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track user behavior and website performance
              </p>
            </div>
            <nav className="flex items-center gap-4">
              <Link 
                href="/sessions"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                View Sessions
              </Link>
              <Link 
                href="/heatmaps"
                className="btn-primary inline-flex items-center gap-2"
              >
                <MousePointer className="w-4 h-4" />
                View Heatmaps
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="text-sm text-muted-foreground">
              Last 24 hours
            </div>
          </div>
          <StatsCards />
        </section>

        {/* Recent Sessions */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
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

        {/* Heatmap Preview */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MousePointer className="w-6 h-6 text-primary" />
              Heatmap Insights
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

        {/* Recent Activity */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Recent Activity
            </h2>
          </div>
          <RecentActivity />
        </section>

        {/* Data Management */}
        <section className="mt-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Data Management
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your tracking data and clear sample/demo content
                </p>
              </div>
              <ClearDataButton />
            </div>
          </div>
        </section>

        {/* Demo Notice */}
        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Live Analytics Demo</h3>
              <p className="text-sm text-muted-foreground">
                This dashboard shows real-time analytics from your website interactions. 
                Every click, scroll, and page view is being tracked and analyzed. 
                Try navigating around the site and watch the data update in real-time!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}