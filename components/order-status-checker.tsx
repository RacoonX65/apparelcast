'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OrderStatusCheckerProps {
  orderId: string
  initialOrder: any
  onOrderUpdate: (order: any) => void
}

export function OrderStatusChecker({ orderId, initialOrder, onOrderUpdate }: OrderStatusCheckerProps) {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    console.log('Setting up real-time subscription for order:', orderId)
    console.log('Initial order status:', initialOrder?.payment_status, initialOrder?.status)
    
    const supabase = createClient()
    
    // Function to fetch and check order status
    const fetchOrderStatus = async () => {
      try {
        console.log('Polling order status...')
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const { order } = await response.json()
          console.log('Polled order data:', {
            payment_status: order.payment_status,
            status: order.status,
            id: order.id
          })
          
          // Check if the order has been updated
          if (order.payment_status !== initialOrder?.payment_status || 
              order.status !== initialOrder?.status) {
            console.log('Order status changed, updating UI')
            onOrderUpdate(order)
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error)
      }
    }
    
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
          console.log('Payload new data:', payload.new)
          
          // Fetch the complete updated order data
          try {
            const response = await fetch(`/api/orders/${orderId}`)
            if (response.ok) {
              const { order } = await response.json()
              console.log('Updated order data from real-time:', order)
              onOrderUpdate(order)
            }
          } catch (error) {
            console.error('Error fetching updated order:', error)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        
        // If subscription fails, fall back to polling
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          console.log('Real-time subscription failed, falling back to polling')
          startPolling()
        }
      })

    // Start polling as a fallback mechanism
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      
      // Poll every 2 seconds for the first 30 seconds, then every 5 seconds
      let pollCount = 0
      const poll = async () => {
        // Check if order is in a final state - stop polling if so
        const currentOrder = await getCurrentOrder()
        if (currentOrder && isFinalOrderState(currentOrder.status)) {
          console.log('Order reached final state, stopping polling:', currentOrder.status)
          return
        }
        
        fetchOrderStatus()
        pollCount++
        
        // Adaptive polling intervals
        let nextInterval
        if (pollCount < 15) { // First 30 seconds (15 * 2s)
          nextInterval = 2000
        } else if (pollCount < 75) { // Next 5 minutes (60 * 5s)
          nextInterval = 5000
        } else { // After 5 minutes, poll every 30 seconds
          nextInterval = 30000
        }
        
        pollingIntervalRef.current = setTimeout(poll, nextInterval)
      }
      
      // Helper function to check if order is in final state
      const isFinalOrderState = (status: string) => {
        return ['delivered', 'cancelled', 'refunded'].includes(status.toLowerCase())
      }
      
      // Helper function to get current order state
      const getCurrentOrder = async () => {
        try {
          const response = await fetch(`/api/orders/${orderId}`)
          if (response.ok) {
            const { order } = await response.json()
            return order
          }
        } catch (error) {
          console.error('Error getting current order:', error)
        }
        return null
      }
      
      // Start polling immediately, then continue
      poll()
    }
    
    // Start polling immediately as a backup
    startPolling()

    // Cleanup subscription and polling on unmount
    return () => {
      console.log('Cleaning up real-time subscription and polling')
      subscription.unsubscribe()
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current)
      }
    }
  }, [orderId, onOrderUpdate, initialOrder])

  return null // This component doesn't render anything
}