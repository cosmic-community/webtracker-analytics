import Link from 'next/link'
import { ArrowLeft, MousePointer, Eye, Target, BarChart3, Clock, Users, TrendingUp } from 'lucide-react'

export default function TestSitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Analytics Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/test-site/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/test-site/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link href="/test-site/pricing" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <Eye className="w-4 h-4" />
              Live Tracking Demo Website
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Experience Real-Time
              <span className="text-blue-600 block">User Analytics</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every click, scroll, and interaction on this page is being tracked in real-time. 
              Watch as your actions contribute to the analytics dashboard and heatmap visualizations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                Watch Demo
              </button>
            </div>

            <div className="text-sm text-gray-500">
              💡 Try clicking buttons, scrolling, and moving your mouse around to generate tracking data!
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Powerful Analytics Features
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover how users interact with your website through comprehensive tracking and visualization tools.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                  <MousePointer className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Click Heatmaps</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualize where users click most frequently with intuitive heat map overlays that reveal user behavior patterns.
                </p>
                <button className="mt-4 text-red-600 font-medium hover:text-red-700">
                  Learn More →
                </button>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Session Recording</h3>
                <p className="text-gray-600 leading-relaxed">
                  Record complete user sessions to understand the full user journey and identify optimization opportunities.
                </p>
                <button className="mt-4 text-blue-600 font-medium hover:text-blue-700">
                  Learn More →
                </button>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor user activity as it happens with live dashboards and instant insights into user behavior.
                </p>
                <button className="mt-4 text-green-600 font-medium hover:text-green-700">
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Growing Teams
              </h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="cursor-pointer hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Websites Tracked</div>
              </div>
              <div className="cursor-pointer hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-green-600 mb-2">50M+</div>
                <div className="text-gray-600">Sessions Recorded</div>
              </div>
              <div className="cursor-pointer hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="cursor-pointer hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Try the Interactive Demo
                </h2>
                <p className="text-gray-600 text-lg">
                  Click, scroll, and interact with the elements below. Your actions are being tracked in real-time!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Sample Form</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <button 
                      type="button"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Form
                    </button>
                  </form>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Elements</h3>
                  <div className="space-y-4">
                    <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Primary Action Button
                    </button>
                    <button className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                      Secondary Button
                    </button>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded hover:bg-red-200 transition-colors">
                        Option A
                      </button>
                      <button className="flex-1 bg-yellow-100 text-yellow-700 py-2 px-3 rounded hover:bg-yellow-200 transition-colors">
                        Option B
                      </button>
                      <button className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded hover:bg-purple-200 transition-colors">
                        Option C
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-600 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Understand Your Users?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Join thousands of websites that use our analytics platform to optimize their user experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Start Free Trial
                </button>
                <Link 
                  href="/dashboard"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
                >
                  View Analytics Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">WebTracker Analytics</h4>
              <p className="text-gray-400 text-sm">
                Understanding user behavior through powerful analytics and visualization tools.
              </p>
            </div>
            <div>
              <h5 className="font-medium mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 WebTracker Analytics. This is a demo website for tracking analytics.
          </div>
        </div>
      </footer>

      {/* Demo Tracking Notice */}
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="font-medium text-sm">Live Tracking Active</div>
            <div className="text-xs text-blue-100 mt-1">
              Your interactions are being recorded for the analytics demo. 
              <Link href="/dashboard" className="underline hover:no-underline ml-1">
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}