"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WhatsAppMessageButtonProps {
  phoneNumber: string
  message: string
  label?: string
}

export function WhatsAppMessageButton({ phoneNumber, message, label = "Send WhatsApp" }: WhatsAppMessageButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopyMessage = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message)
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea")
        textArea.value = message
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        textArea.remove()
      }

      setCopied(true)
      toast({
        title: "Message copied!",
        description: "You can now paste it in WhatsApp",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Clipboard error:", error)
      toast({
        title: "Failed to copy",
        description: "Please copy the message manually",
        variant: "destructive",
      })
    }
  }

  const handleOpenWhatsApp = () => {
    // Format phone number (remove spaces and special characters)
    const formattedPhone = phoneNumber.replace(/\s+/g, "").replace(/[^\d+]/g, "")
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)
    // Open WhatsApp Web with pre-filled message
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, "_blank")
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleOpenWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white">
        <MessageCircle className="w-4 h-4 mr-2" />
        {label}
      </Button>
      <Button onClick={handleCopyMessage} variant="outline" size="icon">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  )
}
