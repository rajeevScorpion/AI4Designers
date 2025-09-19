import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/page-transitions.css'
import { Providers } from '@/components/providers'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { CourseProvider } from '@/contexts/CourseContext'
import { SidebarProvider } from '@/components/ui/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Fundamentals for Designers',
  description: 'A 5-day crash course on AI fundamentals for first-year design students',
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
          <CourseProvider>
            <SidebarProvider defaultOpen={false}>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </SidebarProvider>
          </CourseProvider>
        </Providers>
      </body>
    </html>
  )
}