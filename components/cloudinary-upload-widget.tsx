"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface CloudinaryUploadWidgetProps {
  onUploadComplete: (urls: string[]) => void
  existingImages?: string[]
  maxFiles?: number
}

declare global {
  interface Window {
    cloudinary: any
  }
}

export function CloudinaryUploadWidget({
  onUploadComplete,
  existingImages = [],
  maxFiles = 10,
}: CloudinaryUploadWidgetProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const widgetRef = useRef<any>(null)

  // Load Cloudinary script
  useEffect(() => {
    if (window.cloudinary) {
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js"
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize widget
  useEffect(() => {
    if (!isScriptLoaded || !window.cloudinary) return

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      console.error("[v0] Cloudinary credentials missing")
      return
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder: "products",
        multiple: true,
        maxFiles,
        sources: ["local", "camera", "url"],
        showAdvancedOptions: false,
        cropping: true,
        croppingAspectRatio: 1,
        showCompletedButton: true,
        clientAllowedFormats: ["jpg", "png", "jpeg", "webp"],
        maxFileSize: 8000000, // 8 MB
        resourceType: "image",
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#FADADD",
            tabIcon: "#FADADD",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#FADADD",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#FADADD",
            complete: "#20B832",
            sourceBg: "#F4F4F5",
          },
          frame: {
            background: "rgba(0, 0, 0, 0.8)",
          },
        },
        // Ensure the widget appears above all other elements including dialogs
        zIndex: 9999,
        // Prevent interaction with background elements
        showPoweredBy: false,
        // Ensure proper modal behavior
        modal: true,
      },
      (error: any, result: any) => {
        if (error) {
          console.error("[v0] Cloudinary upload error:", error)
          return
        }

        if (result && result.event === "queues-end") {
          const newImages = result.info.files.map((file: any) => file.uploadInfo.secure_url)
          const allImages = [...uploadedImages, ...newImages]
          setUploadedImages(allImages)
          onUploadComplete(allImages)
        }
      },
    )
  }, [isScriptLoaded, maxFiles, uploadedImages, onUploadComplete])

  const openWidget = () => {
    if (widgetRef.current) {
      // Add a slight delay to ensure the widget opens properly above the dialog
      setTimeout(() => {
        widgetRef.current.open()
      }, 100)
    }
  }

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    onUploadComplete(newImages)
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={openWidget}
        disabled={!isScriptLoaded}
        variant="outline"
        className="w-full border-dashed border-2 h-24 hover:border-primary hover:bg-primary/5 bg-transparent"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isScriptLoaded ? "Upload Product Images" : "Loading uploader..."}
          </span>
        </div>
      </Button>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
              <Image src={url || "/placeholder.svg"} alt={`Product ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} uploaded. First image will be the main
          product image.
        </p>
      )}
    </div>
  )
}
