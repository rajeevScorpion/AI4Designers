interface SmoothScrollOptions {
  duration?: number
  easing?: string
  onComplete?: () => void
}

export const smoothScrollToTop = (options: SmoothScrollOptions = {}) => {
  const {
    duration = 1200, // Slower duration for smoother animation
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)', // Ease-in-out cubic bezier
    onComplete
  } = options

  const startPosition = window.pageYOffset
  const distance = -startPosition
  let startTime: number | null = null

  const animation = (currentTime: number) => {
    if (!startTime) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)

    // Apply easing function
    const easeProgress = applyEasing(progress, easing)

    window.scrollTo(0, startPosition + distance * easeProgress)

    if (progress < 1) {
      window.requestAnimationFrame(animation)
    } else if (onComplete) {
      onComplete()
    }
  }

  window.requestAnimationFrame(animation)
}

const applyEasing = (progress: number, easing: string): number => {
  switch (easing) {
    case 'ease-in-out':
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
    case 'cubic-bezier(0.4, 0, 0.2, 1)':
      // Custom cubic bezier for smooth ease-in-out
      return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
    default:
      return progress
  }
}