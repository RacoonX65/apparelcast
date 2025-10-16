'use client'

import Image from 'next/image'
import Link from 'next/link'

type AdItem = {
  id?: string
  title?: string | null
  subtitle?: string | null
  media_url: string
  media_type?: 'image' | 'video' | null
  cta_text?: string | null
  cta_link?: string | null
}

interface FeaturedAdsProps {
  ads: AdItem[]
}

export function FeaturedAds({ ads }: FeaturedAdsProps) {
  const items = (ads || []).slice(0, 2)

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((ad, idx) => (
        <div key={ad.id ?? idx} className="relative w-full aspect-video overflow-hidden rounded-lg bg-muted">
          {ad.media_type === 'video' ? (
            <video
              src={ad.media_url}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          ) : (
            <Image
              src={ad.media_url}
              alt={ad.title ?? `Ad ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={idx === 0}
            />
          )}

          {(ad.title || ad.subtitle || (ad.cta_text && ad.cta_link)) && (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute left-3 right-3 bottom-3 flex flex-col gap-2">
                {ad.title && (
                  <h3 className="text-white text-lg md:text-xl font-semibold drop-shadow">
                    {ad.title}
                  </h3>
                )}
                {ad.subtitle && (
                  <p className="text-white/90 text-sm md:text-base drop-shadow-sm">
                    {ad.subtitle}
                  </p>
                )}
                {(ad.cta_text && ad.cta_link) && (
                  <Link
                    href={ad.cta_link}
                    aria-label={ad.cta_text || 'Learn more'}
                    className="inline-flex w-fit items-center rounded-md bg-white/90 px-3 py-1 text-sm text-black hover:bg-white"
                  >
                    {ad.cta_text}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default FeaturedAds