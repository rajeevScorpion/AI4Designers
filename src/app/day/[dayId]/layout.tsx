import { LayoutWrapper } from '@/components/layout-wrapper'

export default function DayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>
}