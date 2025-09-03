import Link from 'next/link'
import { Play, BarChart3, MousePointer, Users, Eye, TrendingUp } from 'lucide-react'
import StatsCards from '@/components/StatsCards'
import RecentActivity from '@/components/RecentActivity'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
            WebTracker Analytics
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Understand your users like never before. Record sessions, track interactions, 
            and visualize user behavior with powerful heatmaps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3 rounded-lg"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboard
            </Link>
            <Link
              href="/sessions"
              className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-3 rounded-lg"
            >
              <Play className="w-5 h-5" />
              Browse Sessions
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Powerful Analytics Features
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="stat-card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Session Recording</h3>
            <p className="text-muted-foreground">
              Watch real user sessions with mouse movements, clicks, and scrolls. 
              See exactly how users interact with your site.
            </p>
          </div>
          
          <div className="stat-card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MousePointer className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Interactive Heatmaps</h3>
            <p className="text-muted-foreground">
              Visualize where users click, move their mouse, and scroll. 
              Identify hotspots and optimize your design.
            </p>
          </div>
          
          <div className="stat-card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
            <p className="text-muted-foreground">
              Monitor user behavior in real-time with comprehensive analytics 
              and detailed session statistics.
            </p>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Live Analytics Data
        </h2>
        
        <StatsCards />
      </section>

      {/* Recent Activity */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Recent Activity
        </h2>
        
        <RecentActivity />
      </section>

      {/* Demo Info Section */}
      <section className="container mx-auto px-4 py-16 bg-card/50 rounded-2xl border border-border mx-4 mb-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold">This Site is Being Tracked!</h2>
          <p className="text-lg text-muted-foreground">
            This WebTracker Analytics application is tracking its own usage as a demonstration. 
            Your interactions on this page are being recorded and will appear in the dashboard 
            and session recordings. This is a working MVP that shows the full tracking capabilities.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-500" />
              </div>
              <span className="font-medium">Mouse Tracking</span>
              <span className="text-sm text-muted-foreground">Your cursor position is recorded</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-blue-500" />
              </div>
              <span className="font-medium">Click Recording</span>
              <span className="text-sm text-muted-foreground">All clicks are captured</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <span className="font-medium">Session Data</span>
              <span className="text-sm text-muted-foreground">Full session is saved to Cosmic</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}