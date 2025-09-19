import { useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiOptions {
  particleCount?: number
  angle?: number
  spread?: number
  startVelocity?: number
  decay?: number
  gravity?: number
  colors?: string[]
  origin?: {
    x: number
    y: number
  }
}

export const useConfetti = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const createCanvas = useCallback(() => {
    if (typeof document === 'undefined') return null

    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '9999'
    document.body.appendChild(canvas)

    return canvas
  }, [])

  const fireConfetti = useCallback((options: ConfettiOptions = {}) => {
    const canvas = canvasRef.current || createCanvas()
    if (!canvas) return

    const defaultColors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--secondary))',
      '#ffffff',
      '#f8f9fa'
    ]

    const confettiOptions = {
      particleCount: options.particleCount || 100,
      angle: options.angle || 90,
      spread: options.spread || 45,
      startVelocity: options.startVelocity || 45,
      decay: options.decay || 0.9,
      gravity: options.gravity || 1,
      colors: options.colors || defaultColors,
      origin: options.origin || { x: 0.5, y: 0.5 },
      ...options
    }

    confetti.create(canvas, {
      resize: true,
      useWorker: true
    })(confettiOptions)

    // Clean up after animation
    setTimeout(() => {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
      if (canvasRef.current === canvas) {
        canvasRef.current = null
      }
    }, 3000)
  }, [createCanvas])

  const celebrateCompletion = useCallback(() => {
    // Left side burst
    fireConfetti({
      angle: 0,
      spread: 90,
      origin: { x: 0, y: 0.5 },
      particleCount: 50,
      startVelocity: 55
    })

    // Right side burst
    setTimeout(() => {
      fireConfetti({
        angle: 180,
        spread: 90,
        origin: { x: 1, y: 0.5 },
        particleCount: 50,
        startVelocity: 55
      })
    }, 200)

    // Center burst
    setTimeout(() => {
      fireConfetti({
        angle: 90,
        spread: 360,
        origin: { x: 0.5, y: 0.3 },
        particleCount: 100,
        startVelocity: 45
      })
    }, 400)
  }, [fireConfetti])

  const smallCelebration = useCallback(() => {
    fireConfetti({
      particleCount: 30,
      spread: 60,
      origin: { x: 0.5, y: 0.5 },
      startVelocity: 30
    })
  }, [fireConfetti])

  return {
    fireConfetti,
    celebrateCompletion,
    smallCelebration
  }
}