"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { authStateManager } from "@/lib/supabase/auth-state"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Initializing...")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a code from OAuth provider
        const code = searchParams.get("code")
        const redirectTo = searchParams.get("redirect") || "/"
        
        // Check if we have a state from OAuth provider
        const state = searchParams.get("state")
        
        if (!code) {
          console.error("Auth callback: No code parameter found")
          setError("No authentication code found")
          return
        }

        setStatus("Processing authentication...")
        console.log("Auth callback: Processing authentication code")
        
        // Exchange the code for a session directly in the client
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (sessionError) {
          console.error("Auth callback: Session exchange error:", sessionError)
          setError(sessionError.message)
          return
        }

        if (!data.session) {
          console.error("Auth callback: No session returned")
          setError("Authentication failed - no session returned")
          return
        }

        console.log("Auth callback: Session established successfully")
        setStatus("Session established, refreshing state...")
        
        // Force multiple auth state refreshes with increasing delays
        for (let i = 0; i < 3; i++) {
          setStatus(`Synchronizing user data (attempt ${i+1}/3)...`)
          await authStateManager.refreshAuth()
          await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)))
        }
        
        // Set global window flag for auth success detection
        window.localStorage.setItem('auth_success_timestamp', Date.now().toString())
        
        // Set a cookie that can be detected by other components
        document.cookie = `auth_success=true; max-age=60; path=/; SameSite=Lax`
        
        // Redirect with cache busting
        const cacheBuster = `_auth_refresh=${Date.now()}`
        const finalRedirect = redirectTo.includes('?') 
          ? `${redirectTo}&${cacheBuster}`
          : `${redirectTo}?${cacheBuster}`
        
        setStatus("Authentication complete, redirecting...")
        console.log("Auth callback: Redirecting to", finalRedirect)
        
        // Force a full page reload to ensure clean state
        window.location.href = finalRedirect
      } catch (err) {
        console.error("Auth callback: Unexpected error:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#FFF9F5]">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              onClick={() => router.push("/auth/login")}
              className="w-full bg-[#FADADD] hover:bg-[#F7C8D7] text-[#1a1a1a] py-2 px-4 rounded"
            >
              Return to Login
            </button>
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FADADD] mx-auto"></div>
          <p className="text-[#666] mt-4">{status}</p>
        </div>
      </div>
      <Footer />
    </>
  )
}