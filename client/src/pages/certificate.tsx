import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Share2, Award, Calendar, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface CertificateData {
  fullName: string
  completionDate: string
  courseId: string
}

export default function Certificate() {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isEligible, setIsEligible] = useState(false)
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    checkCertificateEligibility()
  }, [])

  const checkCertificateEligibility = async () => {
    try {
      const response = await fetch("/api/certificate/eligibility", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("supabase_token")}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsEligible(data.eligible)
        if (data.eligible) {
          setCertificateData({
            fullName: data.fullName,
            completionDate: data.completionDate,
            courseId: data.courseId
          })
        }
      }
    } catch (err) {
      console.error("Failed to check certificate eligibility:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateCertificate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("supabase_token")}`
        },
        body: JSON.stringify({
          fullName: user?.fullName,
          courseId: "ai-fundamentals-designers"
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `AI-Fundamentals-Certificate-${user?.fullName}.pdf`
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please sign in to access your certificate.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isEligible) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold">Certificate of Completion</h1>
            <p className="text-muted-foreground">
              Complete all course activities to earn your certificate
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Award className="w-5 h-5" />
                Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  You need to complete all 5 days of the course to receive your certificate.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Complete daily activities and quizzes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Fill out your profile information</span>
                </div>
              </div>
              <Button onClick={() => window.location.href = '/profile'}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
                      {certificateData?.fullName}
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
                      Completed on {new Date(certificateData?.completionDate || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Certificate Footer */}
                <div className="flex justify-between items-end pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Course ID</p>
                    <p className="font-mono text-sm">{certificateData?.courseId}</p>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={generateCertificate}
            disabled={isGenerating}
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Download Certificate"}
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

        {/* Verification Info */}
        <Alert>
          <AlertDescription>
            This certificate can be verified using the unique ID above. Keep it safe as proof of your achievement.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}