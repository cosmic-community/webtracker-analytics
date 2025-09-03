import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TrackingProvider from '@/components/TrackingProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebTracker Analytics',
  description: 'Advanced web analytics and user behavior tracking',
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
        
        {/* WebTracker Script */}
        <script src="/webtracker.js" async></script>
      </body>
    </html>
  )
}