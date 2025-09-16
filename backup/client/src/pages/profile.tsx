import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Calendar, Building, Award, Save } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface ProfileData {
  fullName: string
  email: string
  phone: string
  profession: "student" | "working"
  courseType?: string
  stream?: string
  fieldOfWork?: string
  designation?: string
  organization: string
  dateOfBirth: string
}

export default function Profile() {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    profession: "student",
    courseType: "",
    stream: "",
    fieldOfWork: "",
    designation: "",
    organization: "",
    dateOfBirth: ""
  })

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        profession: (user.profession as "student" | "working") || "student",
        courseType: user.courseType || "",
        stream: user.stream || "",
        fieldOfWork: user.fieldOfWork || "",
        designation: user.designation || "",
        organization: user.organization || "",
        dateOfBirth: user.dateOfBirth || ""
      }))
    }
  }, [user])

  const validateIndianPhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      // Validate phone number
      if (profileData.phone && !validateIndianPhone(profileData.phone)) {
        setMessage({ type: 'error', text: "Please enter a valid Indian mobile number" })
        setIsSaving(false)
        return
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("supabase_token")}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      setMessage({ type: 'success', text: "Profile updated successfully!" })

      // Update user context
      // You might want to add a method in useAuth to refresh user data

    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : "Failed to update profile"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
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
              Please sign in to view and edit your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and track your achievements
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <Alert className={message.type === 'success' ?
            "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200" :
            "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          }>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              This information will be used for your completion certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email ID *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                    disabled
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a valid Indian mobile number (10 digits starting with 6-9)
                </p>
              </div>

              {/* Profession */}
              <div className="space-y-3">
                <Label>Profession *</Label>
                <RadioGroup
                  value={profileData.profession}
                  onValueChange={(value) => handleInputChange("profession", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="working" id="working" />
                    <Label htmlFor="working">Working Professional</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Conditional fields based on profession */}
              {profileData.profession === "student" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="courseType">Course Pursuing *</Label>
                    <Input
                      id="courseType"
                      type="text"
                      placeholder="e.g., UG, PG, Diploma"
                      value={profileData.courseType}
                      onChange={(e) => handleInputChange("courseType", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream">Stream *</Label>
                    <Input
                      id="stream"
                      type="text"
                      placeholder="e.g., Graphic Design, UX Design"
                      value={profileData.stream}
                      onChange={(e) => handleInputChange("stream", e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfWork">Field of Work *</Label>
                    <Input
                      id="fieldOfWork"
                      type="text"
                      placeholder="e.g., UI/UX Design, Product Design"
                      value={profileData.fieldOfWork}
                      onChange={(e) => handleInputChange("fieldOfWork", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation *</Label>
                    <Input
                      id="designation"
                      type="text"
                      placeholder="e.g., Senior Designer, Design Lead"
                      value={profileData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organization">
                  {profileData.profession === "student" ? "College Name *" : "Organization *"}
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="organization"
                    type="text"
                    placeholder={profileData.profession === "student" ? "Enter your college name" : "Enter your organization name"}
                    value={profileData.organization}
                    onChange={(e) => handleInputChange("organization", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Earned Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Earned Badges
            </CardTitle>
            <CardDescription>
              Your achievements will appear here as you progress through the course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Complete course activities to earn badges!
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/certificate'}
              >
                View Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}