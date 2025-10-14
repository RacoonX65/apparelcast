"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, ShoppingBag } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
  order_count: number
}

interface UsersManagementProps {
  users: UserProfile[]
}

export function UsersManagement({ users }: UsersManagementProps) {
  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No users yet.</p>
          </CardContent>
        </Card>
      ) : (
        users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{user.full_name || "No name set"}</h3>
                      {user.is_admin && (
                        <Badge variant="default" className="bg-primary">
                          Admin
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShoppingBag className="h-4 w-4" />
                        <span>{user.order_count} orders</span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Joined {format(new Date(user.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/users/${user.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
