'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Mail, Phone, Calendar, Building, Award, Save, Lock } from "lucide-react"
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
  profileLocked?: boolean;
  isProfileComplete?: boolean;
}

export default function Profile() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileLocked, setProfileLocked] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
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
    const loadProfileData = async () => {
      if (user) {
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          const token = session?.access_token

          if (token) {
            const response = await fetch('/api/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })

            const data = await response.json()

            if (response.ok && data.user) {
              setProfileData(prev => ({
                ...prev,
                fullName: data.user.fullname || "",
                email: data.user.email || "",
                phone: data.user.phone || "",
                profession: data.user.profession || "student",
                courseType: data.user.coursetype || "",
                stream: data.user.stream || "",
                fieldOfWork: data.user.fieldofwork || "",
                designation: data.user.designation || "",
                organization: data.user.organization || "",
                dateOfBirth: data.user.dateofbirth || ""
              }))
              setProfileLocked(data.user.profilelocked || false)
            } else {
              // Fallback to user metadata if no profile exists
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
          }
        } catch (error) {
          console.error('Error loading profile data:', error)
        }
      }
    }

    loadProfileData()
  }, [user])

  const validateIndianPhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const validateForm = () => {
    const errors = []

    if (!profileData.fullName.trim()) errors.push('Full name is required')
    if (!profileData.email.trim()) errors.push('Email is required')
    if (!profileData.phone.trim()) errors.push('Phone number is required')
    if (!profileData.organization.trim()) errors.push('Organization is required')
    if (!profileData.dateOfBirth.trim()) errors.push('Date of birth is required')

    if (profileData.profession === 'student') {
      if (!profileData.courseType?.trim()) errors.push('Course type is required for students')
      if (!profileData.stream?.trim()) errors.push('Stream is required for students')
    } else {
      if (!profileData.fieldOfWork?.trim()) errors.push('Field of work is required for professionals')
      if (!profileData.designation?.trim()) errors.push('Designation is required for professionals')
    }

    if (!validateIndianPhone(profileData.phone)) {
      errors.push('Please enter a valid Indian mobile number')
    }

    return errors
  }

  const handleConfirmSave = async () => {
    setShowConfirmModal(false)
    await handleSubmit()
  }

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      setMessage({
        type: 'error',
        text: errors.join(', ')
      })
      return
    }

    setShowConfirmModal(true)
  }

  const handleSubmit = async () => {
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
        setProfileLocked(true)
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
          {profileLocked && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Profile Locked</span>
            </div>
          )}
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
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  Full Name *
                  {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="pl-10"
                    disabled={profileLocked}
                  />
                </div>
                {profileLocked && (
                  <p className="text-xs text-muted-foreground">
                    Name can only be set once and cannot be changed
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email ID *
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    disabled={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email is permanently locked and cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Contact Number *
                  {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                    disabled={profileLocked}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a valid Indian mobile number (10 digits starting with 6-9)
                </p>
              </div>

              {/* Profession */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  Profession *
                  {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </Label>
                <RadioGroup
                  value={profileData.profession}
                  onValueChange={(value) => handleInputChange("profession", value)}
                  className="flex gap-6"
                  disabled={profileLocked}
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
                    <Label htmlFor="courseType" className="flex items-center gap-2">
                      Course Pursuing *
                      {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </Label>
                    <Input
                      id="courseType"
                      type="text"
                      placeholder="e.g., UG, PG, Diploma"
                      value={profileData.courseType}
                      onChange={(e) => handleInputChange("courseType", e.target.value)}
                      disabled={profileLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream" className="flex items-center gap-2">
                      Stream *
                      {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </Label>
                    <Input
                      id="stream"
                      type="text"
                      placeholder="e.g., Graphic Design, UX Design"
                      value={profileData.stream}
                      onChange={(e) => handleInputChange("stream", e.target.value)}
                      disabled={profileLocked}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfWork" className="flex items-center gap-2">
                      Field of Work *
                      {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </Label>
                    <Input
                      id="fieldOfWork"
                      type="text"
                      placeholder="e.g., UI/UX Design, Product Design"
                      value={profileData.fieldOfWork}
                      onChange={(e) => handleInputChange("fieldOfWork", e.target.value)}
                      disabled={profileLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation" className="flex items-center gap-2">
                      Designation *
                      {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </Label>
                    <Input
                      id="designation"
                      type="text"
                      placeholder="e.g., Senior Designer, Design Lead"
                      value={profileData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      disabled={profileLocked}
                    />
                  </div>
                </div>
              )}

              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organization" className="flex items-center gap-2">
                  {profileData.profession === "student" ? "College Name *" : "Organization *"}
                  {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
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
                    disabled={profileLocked}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  Date of Birth *
                  {profileLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="pl-10"
                    disabled={profileLocked}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving || profileLocked}
                  onClick={handleSaveClick}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Profile Save</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Once you save your profile, all fields except your name will be permanently locked and cannot be modified. Your profile information will be used for certificate generation.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Review
              </Button>
              <Button onClick={handleConfirmSave}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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