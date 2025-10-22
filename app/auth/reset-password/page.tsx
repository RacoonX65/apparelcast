"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if we have a valid session from the password reset email
      if (session?.user) {
        setIsValidSession(true)
      } else {
        setIsValidSession(false)
      }
    }

    checkSession()
  }, [])

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long"
    }
    return null
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
      
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidSession === null) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FADADD] mx-auto"></div>
            <p className="text-[#666] mt-2">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (isValidSession === false) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
          <div className="w-full max-w-sm">
            <Card className="border-[#E8D5D0]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1a1a1a] text-center">
                  Invalid or Expired Link
                </CardTitle>
                <CardDescription className="text-[#666] text-center">
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                  <Lock className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <p className="text-red-700 text-sm">
                    Please request a new password reset link.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Link href="/auth/forgot-password">
                    <Button className="w-full bg-[#FADADD] hover:bg-[#F7C8D7] text-[#1a1a1a]">
                      Request New Reset Link
                    </Button>
                  </Link>
                  
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full text-[#666] hover:text-[#1a1a1a]">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-serif text-[#1a1a1a]">ApparelCast</h1>
              <p className="text-sm text-[#666]">Set your new password</p>
            </div>
            
            <Card className="border-[#E8D5D0]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1a1a1a] flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Reset Password
                </CardTitle>
                <CardDescription className="text-[#666]">
                  {success 
                    ? "Your password has been successfully updated"
                    : "Enter your new password below"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {success ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Password Updated!
                      </h3>
                      <p className="text-green-700 text-sm">
                        Your password has been successfully changed.
                      </p>
                      <p className="text-green-600 text-xs mt-2">
                        Redirecting to login page...
                      </p>
                    </div>
                    
                    <Link href="/auth/login">
                      <Button className="w-full bg-[#FADADD] hover:bg-[#F7C8D7] text-[#1a1a1a]">
                        Continue to Login
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-[#1a1a1a]">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-[#E8D5D0] focus:border-[#FADADD] pr-10"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666] hover:text-[#1a1a1a]"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-[#666]">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword" className="text-[#1a1a1a]">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border-[#E8D5D0] focus:border-[#FADADD] pr-10"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666] hover:text-[#1a1a1a]"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        className="w-full bg-[#FADADD] hover:bg-[#F7C8D7] text-[#1a1a1a]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Updating Password..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}