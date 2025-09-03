import type { Metadata } from 'next'
import './globals.css'
import TrackingProvider from '@/components/TrackingProvider'
import CosmicBadge from '@/components/CosmicBadge'

export const metadata: Metadata = {
  title: 'WebTracker Analytics - Session Recording & Heatmaps',
  description: 'A powerful web analytics platform with session recording and heatmap visualization, similar to Hotjar. Built with Next.js and Cosmic CMS.',
  keywords: 'analytics, session recording, heatmaps, user tracking, web analytics, hotjar alternative',
  authors: [{ name: 'WebTracker Analytics' }],
  openGraph: {
    title: 'WebTracker Analytics - Session Recording & Heatmaps',
    description: 'Understand your users with powerful session recording and heatmap analytics',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get bucket slug for the cosmic badge
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <head>
        <script src="/dashboard-console-capture.js"></script>
      </head>
      <body className="font-sans antialiased">
        <TrackingProvider>
          {children}
          <CosmicBadge bucketSlug={bucketSlug} />
        </TrackingProvider>
      </body>
    </html>
  )
}