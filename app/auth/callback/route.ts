import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectTo = searchParams.get("redirect") || "/"

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // Clean the redirect URL by removing any existing auth refresh parameters
      let cleanRedirectUrl = redirectTo.split('?')[0]
      let existingParams = new URLSearchParams(redirectTo.split('?')[1] || '')
      
      // Remove any existing _auth_refresh parameters
      existingParams.delete('_auth_refresh')
      
      // Add a single cache-busting parameter
      existingParams.set('_auth_refresh', Date.now().toString())
      
      // Build the final redirect URL
      const finalRedirect = existingParams.toString() 
        ? `${origin}${cleanRedirectUrl}?${existingParams.toString()}`
        : `${origin}${cleanRedirectUrl}`
      
      console.log('Auth callback: Redirecting to', finalRedirect)
      
      // Set a cookie to indicate successful auth for the client
      const response = NextResponse.redirect(finalRedirect)
      response.cookies.set('auth_success', 'true', { 
        maxAge: 60, // Extended to 60 seconds for better detection
        path: '/',
        httpOnly: false, // Readable by JavaScript
        sameSite: 'lax'
      })
      
      // Also set a server-side session cookie for better persistence
      response.cookies.set('auth_session', 'active', {
        maxAge: 60,
        path: '/',
        httpOnly: true, // Server-side only
        sameSite: 'lax'
      })
      
      return response
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
