import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientPage } from "./client-page"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; reference?: string | string[]; trxref?: string | string[] }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify payment if reference is provided
  let verificationError = null
  const reference = params.reference || params.trxref
  
  // First, fetch the order to get its details
  const { data: orderForReference } = await supabase
    .from("orders")
    .select("order_number, payment_status")
    .eq("id", params.order_id)
    .single()

  if (reference) {
    try {
      // Handle case where reference might be an array (duplicate params)
      const referenceValue = Array.isArray(reference) ? reference[0] : reference
      console.log("Verifying payment with reference:", referenceValue)
      
      // Use localhost with the correct port for server-side requests
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      const verifyResponse = await fetch(`${baseUrl}/api/paystack/verify?reference=${referenceValue}`)
      
      if (!verifyResponse.ok) {
        console.error("Payment verification failed with status:", verifyResponse.status)
        try {
          const errorData = await verifyResponse.json()
          console.error("Payment verification error data:", errorData)
          verificationError = errorData.error || "Payment verification failed"
        } catch (jsonError) {
          console.error("Failed to parse error response as JSON:", jsonError)
          verificationError = `Payment verification failed with status ${verifyResponse.status}`
        }
      } else {
        try {
          const verifyData = await verifyResponse.json()
          console.log("Payment verification successful:", verifyData)
        } catch (jsonError) {
          console.error("Failed to parse success response as JSON:", jsonError)
        }
      }
    } catch (error) {
    console.error("Payment verification error:", error)
      verificationError = "Failed to verify payment status"
    }
  } else if (orderForReference && orderForReference.payment_status === 'pending' && orderForReference.order_number) {
    // Fallback: If no reference in URL but order is pending, try to verify using order number
    try {
      console.log("No reference in URL, attempting verification with order number:", orderForReference.order_number)
      
      // Use localhost with the correct port for server-side requests
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      const verifyResponse = await fetch(`${baseUrl}/api/paystack/verify?reference=${orderForReference.order_number}`)
      
      if (!verifyResponse.ok) {
        console.error("Fallback payment verification failed with status:", verifyResponse.status)
        try {
          const errorData = await verifyResponse.json()
          console.error("Fallback payment verification error data:", errorData)
          // Don't set verificationError for fallback attempts
        } catch (jsonError) {
          console.error("Failed to parse fallback error response as JSON:", jsonError)
        }
      } else {
        try {
          const verifyData = await verifyResponse.json()
          console.log("Fallback payment verification successful:", verifyData)
        } catch (jsonError) {
          console.error("Failed to parse fallback success response as JSON:", jsonError)
        }
      }
    } catch (error) {
    console.error("Fallback payment verification error:", error)
      // Don't set verificationError for fallback attempts
    }
  }

  // Fetch order details immediately without delay
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses (
        full_name,
        street_address,
        city,
        province,
        postal_code
      )
    `,
    )
    .eq("id", params.order_id)
    .single()

  if (!order) {
    redirect("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <ClientPage 
            initialOrder={order} 
            verificationError={verificationError}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
