# Google Maps Address Picker Setup Guide

## Overview
The Google Maps Address Picker has been integrated into the checkout process to provide customers with an enhanced address selection experience using Google's Places API with autocomplete functionality.

## Features Implemented
- **Smart Address Autocomplete**: Real-time address suggestions as users type
- **Current Location Detection**: Automatic detection of user's current location
- **Manual Entry Fallback**: Option to enter address manually if needed
- **Address Validation**: Ensures complete address information is captured
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### 2. API Key Configuration
1. Create an API key in Google Cloud Console
2. Restrict the API key to your domain for security
3. Add the API key to your environment variables:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Domain Restrictions (Recommended)
For production, restrict your API key to specific domains:
- `yourdomain.com`
- `www.yourdomain.com`
- `localhost:3000` (for development)

## Component Usage

### Address Dialog Integration
The Google Maps Address Picker is integrated into the address dialog with:
- Toggle between automatic and manual address entry
- Real-time address validation
- Automatic population of city, province, and postal code fields

### Checkout Process
- Seamless integration with existing checkout flow
- Enhanced user experience for address selection
- Fallback to manual entry when needed

## Testing
1. Navigate to `/account/addresses` to test address management
2. Navigate to `/checkout` to test checkout address selection
3. Test both automatic address picker and manual entry modes
4. Verify address validation and autocomplete functionality

## Security Considerations
- API key is restricted to specific domains
- Client-side implementation with proper error handling
- Fallback mechanisms for when Google Maps is unavailable

## Browser Compatibility
- Modern browsers with JavaScript enabled
- Graceful degradation for older browsers
- Mobile-responsive design

## Troubleshooting
- Ensure API key is properly configured
- Check that required APIs are enabled in Google Cloud Console
- Verify domain restrictions allow your current domain
- Check browser console for any JavaScript errors