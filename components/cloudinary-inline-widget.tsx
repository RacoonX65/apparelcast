"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"

interface CloudinaryInlineWidgetProps {
  onUploadComplete: (urls: string[]) => void
  existingImages?: string[]
  maxFiles?: number
}

declare global {
  interface Window {
    cloudinary: any
  }
}

export function CloudinaryInlineWidget({
  onUploadComplete,
  existingImages = [],
  maxFiles = 1,
}: CloudinaryInlineWidgetProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const uploadToCloudinary = async (file: File) => {
    if (!isScriptLoaded || !window.cloudinary) {
      console.error("Cloudinary not loaded")
      return null
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary credentials missing")
      return null
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'special-offers')

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      return null
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).slice(0, maxFiles).map(uploadToCloudinary)
      const uploadedUrls = await Promise.all(uploadPromises)
      
      const validUrls = uploadedUrls.filter((url): url is string => url !== null)
      
      if (validUrls.length > 0) {
        const newImages = maxFiles === 1 ? validUrls : [...uploadedImages, ...validUrls]
        setUploadedImages(newImages)
        onUploadComplete(newImages)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    onUploadComplete(newImages)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadedImages.length === 0 ? (
        <Button
          type="button"
          onClick={triggerFileSelect}
          disabled={!isScriptLoaded || isUploading}
          variant="outline"
          className="w-full border-dashed border-2 h-32 hover:border-primary hover:bg-primary/5 bg-transparent"
        >
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isScriptLoaded ? "Click to upload banner image" : "Loading uploader..."}
                </span>
                <span className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP (max 8MB)
                </span>
              </>
            )}
          </div>
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="relative group aspect-video rounded-lg overflow-hidden border bg-muted">
            <Image 
              src={uploadedImages[0] || "/placeholder.svg"} 
              alt="Banner image" 
              fill 
              className="object-cover" 
            />
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              Banner Image
            </div>
          </div>
          
          <Button
            type="button"
            onClick={triggerFileSelect}
            disabled={isUploading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Change Image"}
          </Button>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Banner image uploaded successfully. This will be displayed on your special offer.
        </p>
      )}
    </div>
  )
}