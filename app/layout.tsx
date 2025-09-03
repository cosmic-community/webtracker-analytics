import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TrackingProvider from '@/components/TrackingProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebTracker Analytics - Real-time User Behavior Analytics',
  description: 'Comprehensive user behavior tracking with heatmaps, session recordings, and real-time analytics.',
  keywords: 'web analytics, heatmaps, session recording, user tracking, website analytics',
  authors: [{ name: 'WebTracker Analytics' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrackingProvider>
          {children}
        </TrackingProvider>
      </body>
    </html>
  )
}