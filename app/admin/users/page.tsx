import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UsersManagement } from "@/components/users-management"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Fetch all users with their order counts
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Get order counts for each user
  const profilesWithOrders = await Promise.all(
    (profiles || []).map(async (profile) => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)

      return {
        ...profile,
        order_count: count || 0,
      }
    }),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users Management</h1>
          <p className="text-muted-foreground">View and manage customer accounts</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <UsersManagement users={profilesWithOrders} />
    </div>
  )
}
