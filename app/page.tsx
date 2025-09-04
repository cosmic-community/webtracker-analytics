import Link from 'next/link'
import { BarChart3, MousePointer, Users, Zap, ArrowRight, Target, Eye, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Tracking Demo - Your Clicks Are Being Recorded!
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Website Analytics
            <span className="text-primary block">Made Simple</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track user behavior, visualize click patterns with heatmaps, and understand 
            how visitors interact with your website. All in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              <BarChart3 className="w-5 h-5" />
              View Live Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/heatmaps" 
              className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              <Target className="w-5 h-5" />
              See Heatmaps
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Analytics Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to understand your users and optimize your website performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Session Recording */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Session Recording</h3>
              <p className="text-muted-foreground mb-6">
                Record and replay user sessions to understand exactly how visitors 
                navigate through your website.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Real-time session capture
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  User interaction timeline
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Page navigation tracking
                </li>
              </ul>
            </div>

            {/* Heatmaps */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors group">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                <MousePointer className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Click Heatmaps</h3>
              <p className="text-muted-foreground mb-6">
                Visualize where users click most often with beautiful heatmap 
                overlays that reveal interaction hotspots.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  Click density visualization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  Mouse movement tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  Page-specific heatmaps
                </li>
              </ul>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors group">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Comprehensive dashboard with key metrics, trends, and insights 
                about your website performance.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Real-time statistics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Conversion tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Custom time ranges
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Try the Live Demo
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              This website is actively tracking your interactions! Every click, scroll, 
              and page view is being recorded and analyzed in real-time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Interactive Demo */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Interactive Elements
              </h3>
              <p className="text-muted-foreground mb-6">
                Try clicking these buttons and elements. Your interactions will 
                be visible in the dashboard and heatmaps!
              </p>
              
              <div className="space-y-4">
                <button className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Primary Call-to-Action
                </button>
                <button className="w-full bg-secondary text-secondary-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                  Secondary Button
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                    Click Me
                  </button>
                  <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors">
                    Track This
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-500" />
                Live Tracking
              </h3>
              <p className="text-muted-foreground mb-6">
                See how your actions contribute to the analytics data in real-time.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Session Active</span>
                  </div>
                  <span className="text-sm text-primary font-medium">Recording</span>
                </div>
                
                <Link href="/dashboard" className="block p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">View Dashboard</div>
                      <div className="text-sm text-muted-foreground">See your data live</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </Link>
                
                <Link href="/heatmaps" className="block p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">View Heatmaps</div>
                      <div className="text-sm text-muted-foreground">See click patterns</div>
                    </div>
                    <MousePointer className="w-5 h-5 text-red-500" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Understand Your Users?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Start tracking user behavior and optimize your website with data-driven insights.
            This demo is fully functional - explore all features now!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="bg-white text-primary py-4 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Explore Dashboard
            </Link>
            <Link 
              href="/sessions" 
              className="bg-primary-foreground/10 text-primary-foreground py-4 px-8 rounded-lg font-semibold hover:bg-primary-foreground/20 transition-colors inline-flex items-center gap-2"
            >
              <Clock className="w-5 h-5" />
              View Sessions
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}