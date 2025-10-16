import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  const sessionToken = searchParams.get('sessiontoken')
  const types = searchParams.get('types')
  const components = searchParams.get('components')
  const language = searchParams.get('language') || 'en'

  console.log('Google Places Autocomplete API called with:', {
    input,
    sessionToken,
    types,
    components,
    language
  })

  if (!input) {
    console.error('Missing input parameter')
    return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('Google Places API key not configured')
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  console.log('Using API key:', apiKey.substring(0, 10) + '...')

  try {
    const params = new URLSearchParams({
      input,
      key: apiKey,
      language,
    })

    if (sessionToken) {
      params.append('sessiontoken', sessionToken)
    }
    if (types) {
      params.append('types', types)
    }
    if (components) {
      params.append('components', components)
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Google Places API response status:', response.status, response.statusText)
    console.log('Request URL:', `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Places API HTTP error:', response.status, response.statusText, errorText)
      throw new Error(`Google Places API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Google Places API response data:', data)

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data)
      return NextResponse.json(
        { error: `API Error: ${data.status} - ${data.error_message || 'Unknown error'}` },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Google Places autocomplete error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch autocomplete suggestions' },
      { status: 500 }
    )
  }
}