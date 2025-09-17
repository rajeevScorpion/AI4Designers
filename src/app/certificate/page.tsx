'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Share2, Award, Calendar, CheckCircle } from "lucide-react"

export default function Certificate() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateCertificate = async () => {
    setIsGenerating(true)
    try {
      // Static demo - certificate generation is disabled
      console.log('Certificate generation disabled - authentication removed')
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Auth Disabled Notice */}
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <AlertDescription>
            Authentication has been disabled. This is now a static UI demonstration. Certificate functionality is not available.
          </AlertDescription>
        </Alert>

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
                      Demo Student
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={generateCertificate}
            disabled
            size="lg"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Certificate (Disabled)
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
            This is a demo certificate. Certificate generation requires authentication which has been disabled.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}