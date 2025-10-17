"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-serif text-[#1a1a1a]">ApparelCast</h1>
              <p className="text-sm text-[#666]">Reset your password</p>
            </div>
            
            <Card className="border-[#E8D5D0]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1a1a1a] flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Forgot Password
                </CardTitle>
                <CardDescription className="text-[#666]">
                  {success 
                    ? "Check your email for a password reset link"
                    : "Enter your email address and we'll send you a link to reset your password"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {success ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                      <Mail className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Email Sent!
                      </h3>
                      <p className="text-green-700 text-sm">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      <p className="text-green-600 text-xs mt-2">
                        Check your spam folder if you don't see it in your inbox
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          setSuccess(false)
                          setEmail("")
                        }}
                        variant="outline"
                        className="w-full border-[#E8D5D0] hover:bg-[#FFF9F5]"
                      >
                        Send Another Email
                      </Button>
                      
                      <Link href="/auth/login">
                        <Button
                          variant="ghost"
                          className="w-full text-[#666] hover:text-[#1a1a1a]"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-[#1a1a1a]">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-[#E8D5D0] focus:border-[#FADADD]"
                          disabled={isLoading}
                        />
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
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                      
                      <Link href="/auth/login">
                        <Button
                          variant="ghost"
                          className="w-full text-[#666] hover:text-[#1a1a1a]"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Login
                        </Button>
                      </Link>
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