import { useState, useEffect } from 'react'

// Service Worker registration and management utilities

// Type definition for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface ServiceWorkerStatus {
  supported: boolean
  enabled: boolean
  controller: ServiceWorker | null
  updateAvailable: boolean
  installing: ServiceWorker | null
  waiting: ServiceWorker | null
}

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null
  private updateCallback?: ((registration: ServiceWorkerRegistration) => void) | null

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  // Register service worker
  async register(): Promise<ServiceWorkerStatus> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service Worker not supported')
      return {
        supported: false,
        enabled: false,
        controller: null,
        updateAvailable: false,
        installing: null,
        waiting: null
      }
    }

    try {
      console.log('[SW] Registering service worker...')

      // Register the service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('[SW] Service Worker registered:', this.registration.scope)

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing
        console.log('[SW] New Service Worker found')

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New worker is waiting
              console.log('[SW] Update available - waiting to activate')
              this.notifyUpdate()
            }
          })
        }
      })

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed - reloading page')
        window.location.reload()
      })

      // Check for existing waiting service worker
      if (this.registration.waiting) {
        console.log('[SW] Service Worker already waiting')
        this.notifyUpdate()
      }

      return {
        supported: true,
        enabled: true,
        controller: navigator.serviceWorker.controller,
        updateAvailable: !!this.registration.waiting,
        installing: this.registration.installing || null,
        waiting: this.registration.waiting || null
      }
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
      return {
        supported: true,
        enabled: false,
        controller: null,
        updateAvailable: false,
        installing: null,
        waiting: null
      }
    }
  }

  // Get current service worker status
  getStatus(): ServiceWorkerStatus {
    return {
      supported: 'serviceWorker' in navigator,
      enabled: !!this.registration,
      controller: navigator.serviceWorker.controller,
      updateAvailable: !!this.registration?.waiting,
      installing: this.registration?.installing || null,
      waiting: this.registration?.waiting || null
    }
  }

  // Apply waiting service worker update
  async applyUpdate(): Promise<void> {
    if (this.registration?.waiting) {
      console.log('[SW] Applying update...')
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return true
    }

    try {
      const success = await this.registration.unregister()
      console.log('[SW] Service Worker unregistered:', success)
      this.registration = null
      return success
    } catch (error) {
      console.error('[SW] Failed to unregister Service Worker:', error)
      return false
    }
  }

  // Set callback for update notifications
  onUpdate(callback: (registration: ServiceWorkerRegistration) => void): void {
    this.updateCallback = callback
  }

  // Notify about update
  private notifyUpdate(): void {
    if (this.updateCallback && this.registration) {
      this.updateCallback(this.registration)
    }
  }

  // Clear all caches
  async clearCaches(): Promise<void> {
    if (!this.registration?.active) {
      throw new Error('No active service worker')
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('[SW] Caches cleared successfully')
          resolve()
        } else {
          reject(new Error('Failed to clear caches'))
        }
      }

      // TypeScript knows registration.active exists because of the check above
      this.registration!.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Cache clear timeout'))
      }, 5000)
    })
  }

  // Force sync
  async forceSync(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'FORCE_SYNC'
      })
    }
  }

  // Get cache status
  async getCacheStatus(): Promise<any> {
    if (!this.registration?.active) {
      throw new Error('No active service worker')
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }

      // TypeScript knows registration.active exists because of the check above
      this.registration!.active!.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      )

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Cache status timeout'))
      }, 5000)
    })
  }

  // Check for updates
  async checkForUpdate(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      await this.registration.update()
      return !!this.registration.waiting
    } catch (error) {
      console.error('[SW] Update check failed:', error)
      return false
    }
  }
}

// Export singleton instance - create lazily
let swManagerInstance: ServiceWorkerManager | null = null

export function getServiceWorkerManager(): ServiceWorkerManager | null {
  if (!swManagerInstance && typeof window !== 'undefined') {
    swManagerInstance = ServiceWorkerManager.getInstance()
  }
  return swManagerInstance || null
}

// React hook for service worker status
export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run on client side
    if (!mounted || typeof window === 'undefined') return

    // Get service worker manager instance
    const manager = getServiceWorkerManager()

    // Initialize status
    if (manager) {
      setStatus(manager.getStatus())

      // Register service worker
      manager.register().then(setStatus)
    }

    // Listen for status changes
    const interval = setInterval(() => {
      if (manager) {
        setStatus(manager.getStatus())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [mounted])

  const manager = typeof window !== 'undefined' ? getServiceWorkerManager() : null

  const actions = {
    register: () => manager ? manager.register() : Promise.resolve({ supported: false, enabled: false, controller: null, updateAvailable: false, installing: null, waiting: null }),
    applyUpdate: () => manager ? manager.applyUpdate() : Promise.resolve(),
    clearCaches: () => manager ? manager.clearCaches() : Promise.resolve(),
    forceSync: () => manager ? manager.forceSync() : Promise.resolve(),
    getCacheStatus: () => manager ? manager.getCacheStatus() : Promise.resolve({}),
    checkForUpdate: () => manager ? manager.checkForUpdate() : Promise.resolve(false)
  }

  return {
    status,
    ...actions
  }
}

// PWA installation prompt handler
export class PWAInstallPrompt {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private static instance: PWAInstallPrompt
  private initialized: boolean = false

  private constructor() {}

  static getInstance(): PWAInstallPrompt {
    if (!PWAInstallPrompt.instance) {
      PWAInstallPrompt.instance = new PWAInstallPrompt()
    }
    return PWAInstallPrompt.instance
  }

  // Initialize only on client side
  private init() {
    if (this.initialized || typeof window === 'undefined') return

    this.initialized = true

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent
      console.log('[PWA] Install prompt ready')
    })
  }

  // Check if install prompt is available
  canInstall(): boolean {
    this.init()
    return !!this.deferredPrompt
  }

  // Show install prompt
  async install(): Promise<boolean> {
    this.init()
    if (!this.deferredPrompt) {
      console.log('[PWA] No install prompt available')
      return false
    }

    try {
      // Prompt the user to install
      await this.deferredPrompt.prompt()

      // Wait for the user's response
      const choiceResult = await this.deferredPrompt.userChoice
      console.log('[PWA] Install prompt choiceResult:', choiceResult)

      this.deferredPrompt = null
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('[PWA] Install prompt error:', error)
      this.deferredPrompt = null
      return false
    }
  }

  // Listen for app installed event
  onInstalled(callback: () => void): void {
    this.init()
    if (typeof window === 'undefined') return

    window.addEventListener('appinstalled', (e) => {
      console.log('[PWA] App installed:', e)
      callback()
    })
  }
}

// Export singleton instance - create lazily
let pwaInstallPromptInstance: PWAInstallPrompt | null = null

export function getPWAInstallPrompt(): PWAInstallPrompt | null {
  if (!pwaInstallPromptInstance && typeof window !== 'undefined') {
    pwaInstallPromptInstance = PWAInstallPrompt.getInstance()
  }
  return pwaInstallPromptInstance || null
}

// React hook for PWA installation
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run on client side
    if (!mounted || typeof window === 'undefined') return

    const installPrompt = getPWAInstallPrompt()
    if (installPrompt) {
      setCanInstall(installPrompt.canInstall())

      // Listen for app installed
      installPrompt.onInstalled(() => {
        setIsInstalled(true)
        setCanInstall(false)
      })
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
  }, [mounted])

  const install = async () => {
    if (!mounted || typeof window === 'undefined') return false

    const installPrompt = getPWAInstallPrompt()
    if (!installPrompt) return false

    const success = await installPrompt.install()
    if (success) {
      setCanInstall(false)
    }
    return success
  }

  return {
    canInstall,
    isInstalled,
    install
  }
}