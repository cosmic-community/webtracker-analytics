import Link from 'next/link'
import { ArrowLeft, Target, Users, TrendingUp, Shield } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/test-site"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/test-site" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/test-site/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link href="/test-site/pricing" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About WebTracker Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're passionate about helping businesses understand their users through powerful, 
            privacy-focused analytics that reveal actionable insights about user behavior.
          </p>
        </section>

        {/* Mission Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At WebTracker Analytics, we believe that understanding user behavior shouldn't be complex or invasive. 
              Our mission is to provide simple, powerful tools that help businesses make data-driven decisions 
              while respecting user privacy.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We combine cutting-edge technology with intuitive design to deliver insights that matter. 
              From heatmaps that show exactly where users click to session recordings that reveal the complete user journey, 
              our platform empowers you to optimize your website with confidence.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors cursor-pointer">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Precision</h3>
              <p className="text-gray-600 leading-relaxed">
                We deliver accurate, actionable data that helps you make informed decisions about your user experience.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors cursor-pointer">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                User privacy is paramount. We collect only what's necessary and ensure all data is handled with the highest security standards.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors cursor-pointer">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth</h3>
              <p className="text-gray-600 leading-relaxed">
                We're committed to helping businesses grow by providing insights that lead to better user experiences and increased conversions.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Sarah Chen</h3>
              <p className="text-purple-600 font-medium mb-2">CEO & Co-founder</p>
              <p className="text-gray-600 text-sm">
                10+ years in product analytics, passionate about user-centric design and data-driven growth.
              </p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Marcus Rodriguez</h3>
              <p className="text-purple-600 font-medium mb-2">CTO & Co-founder</p>
              <p className="text-gray-600 text-sm">
                Full-stack engineer with expertise in real-time data processing and scalable web applications.
              </p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Emma Thompson</h3>
              <p className="text-purple-600 font-medium mb-2">Head of Design</p>
              <p className="text-gray-600 text-sm">
                UX/UI designer focused on creating intuitive interfaces that make complex data accessible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-purple-100 mb-6">
              Join thousands of businesses that trust WebTracker Analytics to understand their users.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/test-site/pricing"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View Pricing
              </Link>
              <Link 
                href="/test-site/contact"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}