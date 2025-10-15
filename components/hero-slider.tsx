'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroBanner {
  id: string
  title: string
  subtitle?: string
  description?: string
  media_url: string
  media_type: 'image' | 'video'
  cta_text?: string
  cta_link?: string
  background_overlay_opacity: number
  text_color: 'white' | 'black' | 'primary'
  display_order: number
  is_active: boolean
}

interface HeroSliderProps {
  banners: HeroBanner[]
  autoPlayInterval?: number
  showControls?: boolean
  showDots?: boolean
  className?: string
}

export function HeroSlider({ 
  banners, 
  autoPlayInterval = 5000, 
  showControls = true, 
  showDots = true,
  className 
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const activeBanners = banners.filter(banner => banner.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
  }, [activeBanners.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
  }, [activeBanners.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isHovered || activeBanners.length <= 1) return

    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [isPlaying, isHovered, nextSlide, autoPlayInterval, activeBanners.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') prevSlide()
      if (event.key === 'ArrowRight') nextSlide()
      if (event.key === ' ') {
        event.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevSlide, nextSlide, isPlaying])

  if (activeBanners.length === 0) {
    return (
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-balance">Welcome to ApparelCast</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance mt-6">
            Your trusted fashion destination
          </p>
        </div>
      </section>
    )
  }

  const currentBanner = activeBanners[currentSlide]

  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'black': return 'text-black'
      case 'primary': return 'text-primary'
      default: return 'text-white'
    }
  }

  return (
    <section 
      className={cn("relative h-[70vh] min-h-[500px] overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Background Media */}
            {banner.media_type === 'video' ? (
              <video
                src={banner.media_url}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={banner.media_url}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            )}

            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black transition-opacity duration-300"
              style={{ opacity: banner.background_overlay_opacity }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4 text-center space-y-6">
                {banner.subtitle && (
                  <Badge variant="secondary" className="mb-4">
                    {banner.subtitle}
                  </Badge>
                )}
                
                <h1 className={cn(
                  "text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-balance leading-tight",
                  getTextColorClass(banner.text_color)
                )}>
                  {banner.title}
                </h1>
                
                {banner.description && (
                  <p className={cn(
                    "text-lg md:text-xl max-w-3xl mx-auto text-balance leading-relaxed",
                    getTextColorClass(banner.text_color),
                    banner.text_color === 'white' ? 'text-white/90' : 
                    banner.text_color === 'black' ? 'text-black/80' : 'text-primary/80'
                  )}>
                    {banner.description}
                  </p>
                )}

                {banner.cta_text && banner.cta_link && (
                  <div className="pt-4">
                    <Button asChild size="lg" className="bg-primary hover:bg-accent text-primary-foreground">
                      <Link href={banner.cta_link}>{banner.cta_text}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      {activeBanners.length > 1 && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}

      {/* Dots Navigation */}
      {showDots && activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200",
                index === currentSlide 
                  ? "bg-white scale-110" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 right-6 bg-black/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentSlide + 1} / {activeBanners.length}
        </div>
      )}
    </section>
  )
}