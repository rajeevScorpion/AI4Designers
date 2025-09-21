"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()
  const [isConfettiActive, setIsConfettiActive] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // This is now handled by the parent component
    }
  }, [isOpen])

  const handleCertificateClick = () => {
    setIsConfettiActive(true)

    // Create confetti effect
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
    const confettiCount = 100

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.style.position = 'fixed'
      confetti.style.width = '10px'
      confetti.style.height = '10px'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = '50%'
      confetti.style.top = '50%'
      confetti.style.pointerEvents = 'none'
      confetti.style.zIndex = '9999'
      confetti.style.borderRadius = '50%'

      document.body.appendChild(confetti)

      const angle = (Math.PI * 2 * i) / confettiCount
      const velocity = 200 + Math.random() * 200
      const lifetime = 1000 + Math.random() * 1000

      let startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = elapsed / lifetime

        if (progress >= 1) {
          confetti.remove()
          return
        }

        const currentVelocity = velocity * (1 - progress)
        const gravity = 500
        const x = Math.cos(angle) * currentVelocity * progress
        const y = Math.sin(angle) * currentVelocity * progress + 0.5 * gravity * progress * progress

        confetti.style.transform = `translate(${x}px, ${y}px) scale(${1 - progress})`

        requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }

    setTimeout(() => {
      setIsConfettiActive(false)
      router.push('/signin')
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-out animate-in fade-in-90 zoom-in-90">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold animate-in slide-in-from-bottom-4 duration-500">
              Login to save and track your progress and access all activities for each day
            </h2>
            <p className="text-muted-foreground animate-in slide-in-from-bottom-4 duration-500 delay-150">
              Registered users get certificate and full access
            </p>
          </div>

          <div className="flex gap-3 pt-4 animate-in slide-in-from-bottom-4 duration-500 delay-300">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-muted-foreground/20 text-muted-foreground hover:bg-muted transition-all duration-200 hover:scale-105"
            >
              Just Browsing!
            </Button>
            <Button
              onClick={handleCertificateClick}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Earn a Certificate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}