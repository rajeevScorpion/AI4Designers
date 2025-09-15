import { ThemeToggle } from '../theme-toggle'
import { ThemeProvider } from '../theme-provider'

export default function ThemeToggleExample() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="p-4">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}