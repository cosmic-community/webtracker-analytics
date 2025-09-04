import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebTracker Analytics - Website Tracking & Heatmaps',
  description: 'Complete website tracking solution with session recording, heatmaps, and user analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        
        {/* WebTracker Script - Load on all pages */}
        <script src="/webtracker.js" async></script>
      </body>
    </html>
  )
}