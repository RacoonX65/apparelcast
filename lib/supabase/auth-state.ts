import { supabase } from './client'
import type { User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

// Global auth state manager to ensure consistent auth state across components
class AuthStateManager {
  private static instance: AuthStateManager
  private currentUser: User | null = null
  private listeners: Set<(user: User | null) => void> = new Set()
  private supabase = supabase
  private initialized = false

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager()
    }
    return AuthStateManager.instance
  }

  private constructor() {
    console.log('AuthStateManager: Creating instance...')
    this.listeners = new Set()
    this.currentUser = null
    this.initialized = false
    
    console.log('AuthStateManager: Supabase client created, initializing auth listener...')
    // Initialize auth listener
    this.initializeAuthListener()
  }

  private async initializeAuthListener() {
    if (this.initialized) return
    
    try {
      console.log('AuthStateManager: Initializing auth listener...')
      
      // Set up auth state change listener first
      this.supabase.auth.onAuthStateChange((event: string, session: { user: User | null } | null) => {
        console.log('AuthStateManager: Auth event:', event, 'User:', session?.user?.id)
        this.currentUser = session?.user ?? null
        this.notifyListeners()
      })
      
      // Try multiple times to get initial auth state with increasing delays
      let user = null
      for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`AuthStateManager: Attempt ${attempt} to get initial user...`)
        
        try {
          const { data: { user: currentUser } } = await this.supabase.auth.getUser()
          if (currentUser) {
            user = currentUser
            console.log('AuthStateManager: User found on attempt', attempt, 'ID:', user.id)
            break
          }
        } catch (error) {
          console.log(`AuthStateManager: Attempt ${attempt} failed:`, error)
        }
        
        // Wait longer between attempts
        await new Promise(resolve => setTimeout(resolve, attempt * 200))
      }
      
      console.log('AuthStateManager: Final initial user state:', user?.id)
      this.currentUser = user
      this.initialized = true
      
      // Notify listeners of initial state
      this.notifyListeners()
    } catch (error) {
      console.error('AuthStateManager: Error initializing auth listener:', error)
      this.initialized = true
    }
  }

  subscribe(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback)
    
    // Immediately notify with current state if initialized
    if (this.initialized) {
      callback(this.currentUser)
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isInitialized(): boolean {
    return this.initialized
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser)
      } catch (error) {
        console.error('AuthStateManager: Error notifying listener:', error)
      }
    })
  }

  async refreshAuth() {
    try {
      console.log('AuthStateManager: Refreshing auth state...')
      
      // Check if we have a recent auth timestamp from localStorage
      const authTimestamp = window?.localStorage?.getItem('auth_success_timestamp')
      if (authTimestamp) {
        const timestamp = parseInt(authTimestamp)
        const now = Date.now()
        // If timestamp is recent (within 5 minutes), we're likely in an auth flow
        if (now - timestamp < 300000) {
          console.log('AuthStateManager: Recent auth timestamp detected, extending timeout')
          // Wait a bit longer for session to establish
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      }
      
      // First refresh the session with force option
      const { data: sessionData } = await this.supabase.auth.refreshSession()
      
      // Then get the updated user with a small delay to ensure consistency
      await new Promise(resolve => setTimeout(resolve, 100))
      const { data: { user } } = await this.supabase.auth.getUser()
      
      const currentUserStr = JSON.stringify(this.currentUser)
      const newUserStr = JSON.stringify(user)
      
      if (newUserStr !== currentUserStr) {
        console.log('AuthStateManager: User state changed during refresh')
        console.log('AuthStateManager: Previous user ID:', this.currentUser?.id)
        console.log('AuthStateManager: New user ID:', user?.id)
        
        this.currentUser = user
        this.notifyListeners()
      } else {
        console.log('AuthStateManager: User state unchanged after refresh, ID:', user?.id)
      }
      
      return user
    } catch (error) {
      console.error('AuthStateManager: Error refreshing auth:', error)
      return null
    }
  }
}

// Export singleton instance
export const authStateManager = AuthStateManager.getInstance()

// Hook for React components
export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    const unsubscribe = authStateManager.subscribe((currentUser) => {
      setUser(currentUser)
    })
    
    return unsubscribe
  }, [])
  
  return user
}