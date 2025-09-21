'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, Building, Award, Save } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"

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

interface User {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  profession?: string;
  courseType?: string;
  stream?: string;
  fieldOfWork?: string;
  designation?: string;
  organization?: string;
  dateOfBirth?: string;
}

export default function Profile() {
  const { user } = useAuth()
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

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {}
      setProfileData(prev => ({
        ...prev,
        fullName: metadata.full_name || "",
        email: user.email || "",
        phone: metadata.phone || "",
        profession: metadata.profession || "student",
        courseType: metadata.courseType || "",
        stream: metadata.stream || "",
        fieldOfWork: metadata.fieldOfWork || "",
        designation: metadata.designation || "",
        organization: metadata.organization || "",
        dateOfBirth: metadata.dateOfBirth || ""
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
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: "Profile updated successfully!" })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to update profile'
        })
      }
    } catch (err) {
      console.error('Profile save error:', err)
      setMessage({
        type: 'error',
        text: 'Failed to update profile'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
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
                    disabled={false}
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
                    disabled={false}
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
                    disabled={false}
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
                  disabled={false}
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
                      disabled={false}
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
                      disabled={false}
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
                      disabled={false}
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
                      disabled={false}
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
                    disabled={false}
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
                    disabled={false}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="outline" disabled={isSaving}>
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