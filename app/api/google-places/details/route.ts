import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('place_id')
  const sessionToken = searchParams.get('sessiontoken')
  const fields = searchParams.get('fields') || 'formatted_address,geometry,name,place_id'
  const language = searchParams.get('language') || 'en'

  if (!placeId) {
    return NextResponse.json({ error: 'place_id parameter is required' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields,
      language,
    })

    if (sessionToken) {
      params.append('sessiontoken', sessionToken)
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data)
      return NextResponse.json(
        { error: `API Error: ${data.status} - ${data.error_message || 'Unknown error'}` },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Google Places details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    )
  }
}