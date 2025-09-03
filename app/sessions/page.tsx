import Link from 'next/link'
import { ArrowLeft, Play, Filter, Download, Search } from 'lucide-react'
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
                  Watch and analyze user behavior and interactions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="btn-secondary inline-flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="btn-secondary inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Play className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Session Recording & Playback</h3>
              <p className="text-sm text-muted-foreground">
                Every user interaction on this website is being recorded. You can watch playbacks 
                of user sessions to understand behavior patterns, identify usability issues, and 
                optimize user experience. Click "Watch" on any session to see the visual replay.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Session Filters</h2>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Reset filters
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search session ID or domain..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <select className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">All statuses</option>
              <option value="completed">Completed</option>
              <option value="active">Live Sessions</option>
              <option value="abandoned">Abandoned</option>
            </select>
            
            <select className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">All durations</option>
              <option value="short">Under 1 minute</option>
              <option value="medium">1-5 minutes</option>
              <option value="long">Over 5 minutes</option>
            </select>
          </div>
        </div>

        {/* Session Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
            <div className="text-3xl font-bold text-green-500">
              <span className="loading-shimmer">--</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All recorded sessions
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="relative">
                <Play className="w-6 h-6 text-blue-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Now</h3>
            <div className="text-3xl font-bold text-blue-500">
              <span className="loading-shimmer">1</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Active sessions
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-xl font-bold text-purple-500">Avg</div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Avg Duration</h3>
            <div className="text-3xl font-bold text-purple-500">
              <span className="loading-shimmer">--:--</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Per session
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Playbacks</h3>
            <div className="text-3xl font-bold text-red-500">
              <span className="loading-shimmer">--</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              With recorded events
            </p>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Recent Sessions</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Sessions with recorded interactions available for playback
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-refreshing
              </div>
              
              <select className="text-sm bg-background border border-border rounded px-3 py-1">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="duration">By duration</option>
                <option value="events">By activity</option>
              </select>
            </div>
          </div>
          
          <SessionsList />
        </div>

        {/* Session Recording Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">What Gets Recorded?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Mouse Movements</div>
                  <div className="text-sm text-muted-foreground">
                    Real-time cursor position tracking with smooth playback
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Click Events</div>
                  <div className="text-sm text-muted-foreground">
                    Precise click coordinates with visual feedback and target elements
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Scroll Behavior</div>
                  <div className="text-sm text-muted-foreground">
                    Scroll position changes and page engagement patterns
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Page Navigation</div>
                  <div className="text-sm text-muted-foreground">
                    Page visits and navigation flow throughout the session
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy & Storage</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Collection</h4>
                <p className="text-sm text-muted-foreground">
                  Only user interactions (clicks, scrolls, mouse movements) are recorded. 
                  No sensitive information, text input, or personal data is captured.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Storage</h4>
                <p className="text-sm text-muted-foreground">
                  All session data is securely stored in your Cosmic CMS bucket with 
                  automatic data retention policies and privacy protection.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Usage</h4>
                <p className="text-sm text-muted-foreground">
                  Session recordings are used exclusively for user experience analysis 
                  and website optimization purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}