'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OrderStatusCheckerProps {
  orderId: string
  initialOrder: any
  onOrderUpdate: (order: any) => void
}

export function OrderStatusChecker({ orderId, initialOrder, onOrderUpdate }: OrderStatusCheckerProps) {
  useEffect(() => {
    console.log('Setting up real-time subscription for order:', orderId)
    
    const supabase = createClient()
    
    // Set up real-time subscription to listen for order changes
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        async (payload) => {
          console.log('Real-time order update received:', payload)
          
          // Fetch the complete updated order data
          try {
            const response = await fetch(`/api/orders/${orderId}`)
            if (response.ok) {
              const { order } = await response.json()
              console.log('Updated order data:', order)
              onOrderUpdate(order)
            }
          } catch (error) {
            console.error('Error fetching updated order:', error)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription')
      subscription.unsubscribe()
    }
  }, [orderId, onOrderUpdate])

  return null // This component doesn't render anything
}