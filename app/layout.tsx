import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TrackingProvider from '@/components/TrackingProvider'
import CosmicBadge from '@/components/CosmicBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebTracker Analytics - Session Recording & Heatmaps',
  description: 'A powerful web analytics platform similar to Hotjar that captures user interactions, records session replays, and generates heatmaps.',
  keywords: 'analytics, hotjar, session recording, heatmaps, user tracking, web analytics',
  authors: [{ name: 'WebTracker Team' }],
  openGraph: {
    title: 'WebTracker Analytics - Session Recording & Heatmaps',
    description: 'A powerful web analytics platform similar to Hotjar that captures user interactions, records session replays, and generates heatmaps.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&auto=format',
        width: 1200,
        height: 630,
        alt: 'WebTracker Analytics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebTracker Analytics - Session Recording & Heatmaps',
    description: 'A powerful web analytics platform similar to Hotjar that captures user interactions, records session replays, and generates heatmaps.',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&auto=format'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <head>
        {/* Console capture script for dashboard debugging */}
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className={inter.className}>
        <TrackingProvider>
          {children}
        </TrackingProvider>
        
        {/* Built with Cosmic badge */}
        <CosmicBadge bucketSlug={bucketSlug} />
      </body>
    </html>
  )
}