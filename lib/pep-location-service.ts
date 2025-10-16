import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from './supabase/service'

export interface UserSubmittedPepLocation {
  id?: string
  name: string
  address: string
  city: string
  province: string
  postal_code?: string
  phone?: string
  latitude?: number
  longitude?: number
  full_address: string
  submitted_by?: string
  submitted_at?: string
  status?: 'pending' | 'approved' | 'rejected'
  moderated_by?: string
  moderated_at?: string
  moderation_notes?: string
  created_at?: string
  updated_at?: string
}

export interface SubmitLocationData {
  name: string
  phone?: string
  address: {
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
    full_address: string
    latitude?: number
    longitude?: number
  }
}

class PepLocationService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Submit a new PEP location for review
   */
  async submitLocation(data: SubmitLocationData, userId: string): Promise<{ success: boolean; error?: string; data?: UserSubmittedPepLocation }> {
    try {
      // Validate required fields
      if (!data.name.trim()) {
        return { success: false, error: 'Store name is required' }
      }

      if (!data.address || !data.address.full_address.trim()) {
        return { success: false, error: 'Store address is required' }
      }

      // Check if location already exists (within 100m radius)
      if (data.address.latitude && data.address.longitude) {
        const { data: existingLocations } = await this.supabase
          .from('user_submitted_pep_locations')
          .select('*')
          .gte('latitude', data.address.latitude - 0.001) // ~100m
          .lte('latitude', data.address.latitude + 0.001)
          .gte('longitude', data.address.longitude - 0.001)
          .lte('longitude', data.address.longitude + 0.001)

        if (existingLocations && existingLocations.length > 0) {
          return { success: false, error: 'A location already exists very close to this address' }
        }
      }

      // Prepare location data
      const locationData: Omit<UserSubmittedPepLocation, 'id' | 'created_at' | 'updated_at'> = {
        name: data.name.trim(),
        address: data.address.street_address,
        city: data.address.city,
        province: data.address.state,
        postal_code: data.address.postal_code,
        phone: data.phone?.trim() || undefined,
        latitude: data.address.latitude,
        longitude: data.address.longitude,
        full_address: data.address.full_address,
        submitted_by: userId,
        status: 'pending'
      }

      // Insert into database
      const { data: insertedLocation, error } = await this.supabase
        .from('user_submitted_pep_locations')
        .insert(locationData)
        .select()
        .single()

      if (error) {
        console.error('Error submitting location:', error)
        return { success: false, error: 'Failed to submit location. Please try again.' }
      }

      return { success: true, data: insertedLocation }
    } catch (error) {
      console.error('Error in submitLocation:', error)
      return { success: false, error: 'An unexpected error occurred. Please try again.' }
    }
  }

  /**
   * Get user's submitted locations
   */
  async getUserSubmittedLocations(userId: string): Promise<UserSubmittedPepLocation[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_submitted_pep_locations')
        .select('*')
        .eq('submitted_by', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user locations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserSubmittedLocations:', error)
      return []
    }
  }

  /**
   * Get approved locations (for public use)
   */
  async getApprovedLocations(): Promise<UserSubmittedPepLocation[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_submitted_pep_locations')
        .select('*')
        .eq('status', 'approved')
        .order('name')

      if (error) {
        console.error('Error fetching approved locations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getApprovedLocations:', error)
      return []
    }
  }

  /**
   * Admin: Get all locations for moderation
   */
  async getAllLocationsForModeration(): Promise<UserSubmittedPepLocation[]> {
    try {
      const serviceClient = createServiceClient()
      const { data, error } = await serviceClient
        .from('user_submitted_pep_locations')
        .select(`
          *,
          submitted_user:profiles!user_submitted_pep_locations_submitted_by_fkey(email, full_name),
          moderated_user:profiles!user_submitted_pep_locations_moderated_by_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching locations for moderation:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllLocationsForModeration:', error)
      return []
    }
  }

  /**
   * Check if a location already exists nearby (within 1km radius)
   */
  private async checkNearbyLocation(latitude: number, longitude: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_submitted_pep_locations')
        .select('id, latitude, longitude')
        .eq('status', 'approved')

      if (error) throw error

      // Simple distance check (approximately 1km = 0.01 degrees)
      const threshold = 0.01
      const hasNearby = data?.some(location => {
        if (!location.latitude || !location.longitude) return false
        
        const latDiff = Math.abs(location.latitude - latitude)
        const lonDiff = Math.abs(location.longitude - longitude)
        
        return latDiff < threshold && lonDiff < threshold
      })

      return hasNearby || false
    } catch (error) {
      console.error('Error checking nearby locations:', error)
      return false
    }
  }

  /**
   * Admin: Moderate a location (approve/reject)
   */
  async moderateLocation(
    locationId: string, 
    status: 'approved' | 'rejected', 
    moderatorId: string, 
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const serviceClient = createServiceClient()
      const { error } = await serviceClient
        .from('user_submitted_pep_locations')
        .update({
          status,
          moderated_by: moderatorId,
          moderated_at: new Date().toISOString(),
          moderation_notes: notes
        })
        .eq('id', locationId)

      if (error) {
        console.error('Error moderating location:', error)
        return { success: false, error: 'Failed to moderate location' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in moderateLocation:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

export const pepLocationService = new PepLocationService()