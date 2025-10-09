import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/page-transitions.css'
import { Providers } from '@/components/providers'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { CourseProvider } from '@/contexts/CourseContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { ServiceWorkerManager } from '@/components/ServiceWorkerManager'
import { SyncStatus } from '@/components/sync-status'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Fundamentals for Designers',
  description: 'A 5-day crash course on AI fundamentals for first-year design students',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI4Designers',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'AI4Designers',
    title: 'AI Fundamentals for Designers',
    description: 'A 5-day crash course on AI fundamentals for first-year design students',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Fundamentals for Designers',
    description: 'A 5-day crash course on AI fundamentals for first-year design students',
  },
  icons: {
    icon: [
      { url: '/images/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
}

export const viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  mobileWebAppCapable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            <CourseProvider>
              <SidebarProvider defaultOpen={false}>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </SidebarProvider>
              <ServiceWorkerManager />
              <SyncStatus />
            </CourseProvider>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}