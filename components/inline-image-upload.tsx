"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import Cropper from "react-easy-crop"

interface InlineImageUploadProps {
  onUploadComplete: (urls: string[]) => void
  existingImages?: string[]
  maxFiles?: number
  showLabel?: boolean
  onUploadCompleteDetailed?: (files: { url: string; type: 'image' | 'video' }[]) => void
  enableVideo?: boolean
  enableCrop?: boolean
  cropAspect?: number
  showPreviewGrid?: boolean
}

export function InlineImageUpload({ 
  onUploadComplete, 
  existingImages = [], 
  maxFiles = 10,
  showLabel = true,
  onUploadCompleteDetailed,
  enableVideo = false,
  enableCrop = false,
  cropAspect = 16 / 9,
  showPreviewGrid = true,
}: InlineImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ width: number; height: number; x: number; y: number } | null>(null)

  const uploadToCloudinary = async (file: File): Promise<{ url: string; type: 'image' | 'video' }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')

    const isVideo = file.type.startsWith('video/')
    const resourcePath = isVideo ? 'video/upload' : 'image/upload'
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourcePath}`

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      return { url: data.secure_url, type: isVideo ? 'video' : 'image' }
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const onCropComplete = (_: any, croppedAreaPixelsValue: { width: number; height: number; x: number; y: number }) => {
    setCroppedAreaPixels(croppedAreaPixelsValue)
  }

  const getCroppedImageFile = async (imageSrc: string, pixelCrop: { width: number; height: number; x: number; y: number }, originalName?: string): Promise<File> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = imageSrc
    })

    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')!

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.95)
    })
    const fileName = originalName ? `cropped-${originalName.replace(/\.[^/.]+$/, '')}.jpg` : 'cropped.jpg'
    return new File([blob], fileName, { type: 'image/jpeg' })
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    
    try {
      // For single file uploads (maxFiles=1), allow replacement of existing file
      const effectiveFiles = maxFiles === 1 
        ? Array.from(files).slice(0, 1) 
        : Array.from(files).slice(0, Math.max(0, maxFiles - images.length))
      
      const filesToHandle = effectiveFiles

      // If cropping is enabled and first file is image, start crop flow
      if (enableCrop && filesToHandle.length > 0 && filesToHandle[0].type.startsWith('image/')) {
        const firstImage = filesToHandle[0]
        const dataUrl = await readFileAsDataURL(firstImage)
        setSelectedImageFile(firstImage)
        setCropImageSrc(dataUrl)
        setIsCropping(true)
        setIsUploading(false)
        return
      }

      // Otherwise, upload directly (supports images and optionally videos)
      const uploadPromises = filesToHandle.map(uploadToCloudinary)
      const uploaded = await Promise.all(uploadPromises)

      const uploadedImageUrls = uploaded.filter(u => u.type === 'image').map(u => u.url)
      
      // For single file uploads, replace existing images; for multi-file, append
      const newImages = maxFiles === 1 ? uploadedImageUrls : [...images, ...uploadedImageUrls]
      setImages(newImages)

      // Backward-compatible callback
      if (uploadedImageUrls.length > 0) {
        onUploadComplete(newImages)
      }
      // Detailed callback with type info
      if (onUploadCompleteDetailed) {
        onUploadCompleteDetailed(uploaded)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onUploadComplete(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const applyCrop = async () => {
    if (!cropImageSrc || !croppedAreaPixels || !selectedImageFile) return
    setIsUploading(true)
    try {
      const croppedFile = await getCroppedImageFile(cropImageSrc, croppedAreaPixels, selectedImageFile.name)
      const uploaded = await uploadToCloudinary(croppedFile)

      // For single file uploads, replace existing images; for multi-file, append
      const newImages = maxFiles === 1 
        ? [uploaded.type === 'image' ? uploaded.url : ''].filter(Boolean)
        : [...images, uploaded.type === 'image' ? uploaded.url : ''].filter(Boolean)
      
      setImages(newImages)

      if (uploaded.type === 'image') {
        onUploadComplete(newImages)
      }
      if (onUploadCompleteDetailed) {
        onUploadCompleteDetailed([uploaded])
      }
    } catch (error) {
      console.error('Crop/upload error:', error)
    } finally {
      setIsUploading(false)
      setIsCropping(false)
      setCropImageSrc(null)
      setSelectedImageFile(null)
    }
  }

  const cancelCrop = () => {
    setIsCropping(false)
    setCropImageSrc(null)
    setSelectedImageFile(null)
  }

  return (
    <div className="space-y-4">
      {showLabel && <Label>Product Images</Label>}
      
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <CardContent className="p-6">
          {!isCropping ? (
            <div
              className="text-center cursor-pointer"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-muted">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-2">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">
                {enableVideo ? 'Images or MP4 videos up to 10MB each' : 'PNG, JPG, GIF up to 10MB each'} (max {maxFiles} {maxFiles === 1 ? 'file' : 'files'})
              </p>
            </div>
          ) : (
            <div>
              <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                {cropImageSrc && (
                  <Cropper
                    image={cropImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={cropAspect}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Button type="button" onClick={applyCrop} disabled={isUploading}>
                  {isUploading ? 'Applying…' : 'Apply Crop'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelCrop} disabled={isUploading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <Input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={enableVideo ? "image/*,video/*" : "image/*"}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {showPreviewGrid && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showPreviewGrid && images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded. 
          The first image will be used as the main product image.
        </p>
      )}
    </div>
  )
}