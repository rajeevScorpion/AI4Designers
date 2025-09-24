'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Share2, Award, Calendar, CheckCircle } from "lucide-react"

export default function Certificate() {
  const { user, loading } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchUserProgress()
    }
  }, [user])

  const fetchUserProgress = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data)
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error)
    }
  }

  const generateCertificate = async () => {
    if (!user) return

    setIsGenerating(true)
    try {
      // Check if user has completed all days
      const completedDays = userProgress?.overallProgress?.totalDaysCompleted || 0
      if (completedDays < 5) {
        alert('You must complete all 5 days to generate a certificate')
        return
      }

      // Get auth token
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Generate certificate
      const response = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ai-fundamentals-certificate-${user.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error("Failed to generate certificate:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Fundamentals for Designers Certificate',
          text: `I've successfully completed the AI Fundamentals for Designers course!`,
          url: window.location.href
        })
      } catch (err) {
        console.error("Failed to share:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Certificate of Completion</h1>
            <p className="text-muted-foreground">
              Please sign in to access your certificate
            </p>
            <Button onClick={() => window.location.href = '/signin'}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const completedDays = userProgress?.overallProgress?.totalDaysCompleted || 0
  const canGenerateCertificate = completedDays >= 5

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Certificate of Completion</h1>
          <p className="text-muted-foreground">
            Congratulations on completing the AI Fundamentals for Designers course!
          </p>
        </div>

        {/* Certificate Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-12">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                {/* Certificate Header */}
                <div className="space-y-2">
                  <Badge variant="outline" className="px-4 py-1 text-sm">
                    Certificate of Completion
                  </Badge>
                  <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                    AI Fundamentals for Designers
                  </h2>
                </div>

                {/* Certificate Content */}
                <div className="space-y-6">
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    This is to certify that
                  </p>
                  <div className="py-4 px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm inline-block">
                    <h3 className="text-3xl font-bold text-primary">
                      {user.user_metadata?.full_name || user.user_metadata?.fullName || user.email}
                    </h3>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    has successfully completed the 5-day crash course on
                  </p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    AI Fundamentals for Designers
                  </p>
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Completed on {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Certificate Footer */}
                <div className="flex justify-between items-end pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Course ID</p>
                    <p className="font-mono text-sm">AI-FUND-DESIGN-001</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-0.5 bg-gray-800 dark:bg-gray-200 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Info */}
        {!canGenerateCertificate && (
          <Alert>
            <AlertDescription>
              Complete all 5 days of the course to generate your certificate.
              Current progress: {completedDays}/5 days completed.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={generateCertificate}
            disabled={!canGenerateCertificate || isGenerating}
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Download Certificate'}
          </Button>
          <Button
            onClick={shareCertificate}
            variant="outline"
            size="lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Achievement
          </Button>
        </div>
      </div>
    </div>
  )
}