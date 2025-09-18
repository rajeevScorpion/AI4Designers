'use client'

import { Header } from './header'

interface HomeLayoutWrapperProps {
  children: React.ReactNode
}

export function HomeLayoutWrapper({ children }: HomeLayoutWrapperProps) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </>
  )
}