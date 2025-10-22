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
      
      // Small delay to ensure auth is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get initial auth state
      const { data: { user } } = await this.supabase.auth.getUser()
      console.log('AuthStateManager: Initial user state:', user?.id)
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
      const { data: { user } } = await this.supabase.auth.getUser()
      if (user?.id !== this.currentUser?.id) {
        this.currentUser = user
        this.notifyListeners()
      }
    } catch (error) {
      console.error('AuthStateManager: Error refreshing auth:', error)
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