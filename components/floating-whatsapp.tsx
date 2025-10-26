"use client"

import { useState } from "react"
import { MessageCircle, X, Phone, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)

  const whatsappOptions = [
    {
      id: "sales",
      title: "Sales & Product Questions",
      description: "Product info, sizing, availability",
      phone: "+27737573087",
      icon: ShoppingBag,
      message: "Hi! I'm interested in your products and would like some help with my shopping. Can you assist me?"
    },
    {
      id: "support",
      title: "Orders & Support",
      description: "Order status, returns, technical help",
      phone: "+27603910551",
      icon: Phone,
      message: "Hello! I need help with my order or have a support question. Can you please assist me?"
    }
  ]

  const handleWhatsAppClick = (phone: string, message: string) => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options Menu */}
      {isOpen && (
        <div className="mb-4 space-y-3">
          {whatsappOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <Card 
                key={option.id} 
                className="w-80 shadow-lg border-0 bg-white/95 backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300"
              >
                <CardContent className="p-4">
                  <button
                    onClick={() => handleWhatsAppClick(option.phone, option.message)}
                    className="w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-[#25D366]/10 p-2 rounded-lg">
                        <IconComponent className="h-5 w-5 text-[#25D366]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {option.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#25D366]">
                          <MessageCircle className="h-3 w-3" />
                          <span>{option.phone}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Main WhatsApp Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={`
          h-14 w-14 rounded-full shadow-lg transition-all duration-300 border-0
          ${isOpen 
            ? 'bg-gray-600 hover:bg-gray-700' 
            : 'bg-[#25D366] hover:bg-[#20BA5A] hover:scale-110'
          }
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      )}
    </div>
  )
}