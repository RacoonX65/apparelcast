# OpenStreetMap Address Picker Setup Guide

## Overview
The OpenStreetMap Address Picker provides a completely free address search solution using the Nominatim API. This replaces Google Maps with no API limits, no costs, and excellent coverage for South African addresses.

## Features Implemented
- **Smart Address Search**: Real-time address suggestions using OpenStreetMap data
- **Current Location Detection**: Automatic detection of user's current location with reverse geocoding
- **Manual Entry Fallback**: Option to enter address manually if needed
- **Address Validation**: Ensures complete address information is captured
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **South Africa Focused**: Optimized for South African addresses with country restrictions

## Benefits Over Google Maps
- ✅ **Completely Free**: No API costs or usage limits
- ✅ **No API Key Required**: No setup or configuration needed
- ✅ **Open Source**: Built on OpenStreetMap data
- ✅ **Privacy Friendly**: No tracking or data collection
- ✅ **Reliable**: Backed by the global OpenStreetMap community

## Technical Implementation

### API Used
- **Nominatim API**: OpenStreetMap's geocoding service
- **Search Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Reverse Geocoding**: `https://nominatim.openstreetmap.org/reverse`

### South Africa Optimization
The component is optimized for South African addresses with:
- Country restriction to South Africa (`countrycodes: 'za'`)
- Bounding box limitation to South African coordinates
- Province and city mapping for local address formats

### Component Features
```typescript
interface FormattedAddress {
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  full_address: string
  latitude?: number
  longitude?: number
}
```

## Component Usage

### Address Dialog Integration
The OpenStreetMap Address Picker is integrated into the address dialog with:
- Toggle between automatic search and manual address entry
- Real-time address suggestions with debounced search
- Automatic population of city, province, and postal code fields
- Visual feedback during search operations

### Search Functionality
- **Debounced Search**: 500ms delay to prevent excessive API calls
- **Minimum Query Length**: 3 characters before search begins
- **Result Limiting**: Maximum 5 suggestions to keep UI clean
- **Click Outside**: Suggestions close when clicking outside

### Current Location
- Uses browser's geolocation API
- Reverse geocodes coordinates to readable address
- Handles permission requests and errors gracefully
- 10-second timeout with high accuracy enabled

## No Setup Required

Unlike Google Maps, OpenStreetMap requires **zero configuration**:
- No API keys to manage
- No billing accounts to set up
- No usage limits to monitor
- No domain restrictions needed

## Usage Guidelines

### Fair Use Policy
While free, please follow Nominatim's usage policy:
- Maximum 1 request per second
- Include a valid User-Agent header
- Don't make bulk requests
- Cache results when possible

Our implementation includes:
- Automatic debouncing (500ms delay)
- Reasonable request limits
- Proper error handling

## Fallback Options

The component gracefully handles various scenarios:
1. **No Internet**: Falls back to manual entry
2. **API Unavailable**: Shows manual input option
3. **No Results**: Allows manual address entry
4. **Location Denied**: Manual entry remains available

## Migration from Google Maps

The OpenStreetMap component is a drop-in replacement:
- Same interface and props
- Same address format output
- Same user experience
- No breaking changes required

## Support and Maintenance

- **Community Driven**: Backed by global OpenStreetMap community
- **Regular Updates**: Map data updated continuously
- **No Vendor Lock-in**: Open source and standards-based
- **Long-term Stability**: Not dependent on commercial API changes