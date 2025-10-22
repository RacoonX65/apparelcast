"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AddressDialog } from "@/components/address-dialog"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AddressManagementProps {
  addresses: any[]
}

export function AddressManagement({ addresses }: AddressManagementProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = (address: any) => {
    setEditingAddress(address)
    setShowDialog(true)
  }

  const handleAdd = () => {
    setEditingAddress(null)
    setShowDialog(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    setDeletingId(addressId)
    try {
      const { error } = await supabase.from("addresses").delete().eq("id", addressId)

      if (error) throw error

      toast({
        title: "Address deleted",
        description: "Address has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
    console.error("Delete address error:", error)
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{address.full_name}</p>
                    {address.is_default && (
                      <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(address)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{address.phone}</p>
                  <p>{address.street_address}</p>
                  <p>
                    {address.city}, {address.province} {address.postal_code}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Address Card */}
        <Card className="border-dashed">
          <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
            <Button variant="outline" onClick={handleAdd} className="bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddressDialog open={showDialog} onOpenChange={setShowDialog} address={editingAddress} />
    </>
  )
}
