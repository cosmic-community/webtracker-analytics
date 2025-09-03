import Link from 'next/link'
import { ArrowLeft, Play, Calendar, Clock, MousePointer, Eye } from 'lucide-react'
import SessionsList from '@/components/SessionsList'

export default function SessionsPage() {
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
                  <Play className="w-8 h-8 text-primary" />
                  Session Recordings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Browse and replay user interaction sessions
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
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Session Recording Active</h3>
              <p className="text-sm text-muted-foreground">
                Your current session is being recorded! Every mouse movement, click, and scroll 
                is captured and stored. Come back to this page later to see your own session 
                in the list below. This demonstrates the real-time tracking capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Sessions Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
            <div className="text-3xl font-bold text-primary">
              <span className="loading-shimmer">Loading...</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All recorded user sessions
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Avg Duration</h3>
            <div className="text-3xl font-bold text-blue-500">
              <span className="loading-shimmer">--:--</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Average session length
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MousePointer className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Events</h3>
            <div className="text-3xl font-bold text-green-500">
              <span className="loading-shimmer">Loading...</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Mouse, click & scroll events
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters & Search</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm">
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Page URL</label>
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm">
                <option value="">All pages</option>
                <option value="/">Homepage</option>
                <option value="/dashboard">Dashboard</option>
                <option value="/sessions">Sessions</option>
                <option value="/heatmaps">Heatmaps</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm">
                <option value="">Any duration</option>
                <option value="short">Under 30s</option>
                <option value="medium">30s - 5min</option>
                <option value="long">Over 5min</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Sessions
            </h2>
            <p className="text-muted-foreground mt-1">
              Click on any session to view the replay
            </p>
          </div>
          
          <SessionsList />
        </div>

        {/* How it Works */}
        <div className="mt-8 bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How Session Recording Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium mb-2">Capture Events</h4>
              <p className="text-sm text-muted-foreground">
                Mouse movements, clicks, scrolls, and page navigation are recorded in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium mb-2">Store in Cosmic</h4>
              <p className="text-sm text-muted-foreground">
                All session data is securely stored in your Cosmic CMS bucket
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium mb-2">Replay & Analyze</h4>
              <p className="text-sm text-muted-foreground">
                Browse sessions and watch user interactions to understand behavior patterns
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}