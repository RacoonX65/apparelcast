# Google Places API Setup Guide

## Overview
This guide will help you set up Google Places API for address autocomplete functionality in ApparelCast.

## Pricing & Free Tier
- **$200 monthly free credit** (applies until February 28, 2025)
- **Autocomplete sessions are FREE** when properly implemented with session tokens
- **Place Details calls** are charged separately (but covered by free credit for most use cases)

### Estimated Monthly Usage with Free Tier:
- **Autocomplete requests**: ~40,000-50,000 (FREE with session tokens)
- **Place Details requests**: ~6,600-10,000 (within $200 credit)
- **Total estimated searches**: 40,000+ per month

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Required APIs
1. Navigate to **APIs & Services** → **Library**
2. Enable these APIs:
   - **Places API (New)** - Required for autocomplete
   - **Maps JavaScript API** - Required for map integration

### 3. Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key
4. **Important**: Restrict your API key for security

### 4. Restrict API Key (Security)
1. Click on your API key to edit it
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add your domains:
     - `http://localhost:3000/*` (for development)
     - `https://yourdomain.com/*` (for production)
3. Under **API restrictions**:
   - Select **Restrict key**
   - Choose: Places API (New), Maps JavaScript API

### 5. Add API Key to Environment
1. Open your `.env.local` file
2. Replace `your_google_places_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC4R6AN7SmxxdKVQjfVR2C...
   ```

### 6. Test the Integration
1. Restart your development server: `npm run dev`
2. Navigate to PEP Location submission
3. Try searching for malls or stores by name
4. Verify autocomplete suggestions appear

## Cost Optimization Tips

### 1. Use Session Tokens
- Our implementation automatically uses session tokens
- This makes autocomplete requests FREE
- Only pay for Place Details when user selects a result

### 2. Implement Debouncing
- Our implementation includes 300ms debouncing
- Reduces unnecessary API calls while typing

### 3. Cache Results
- Consider implementing local caching for frequently searched places
- Reduces API calls for popular locations

### 4. Monitor Usage
1. Go to **APIs & Services** → **Dashboard**
2. Monitor your API usage and costs
3. Set up billing alerts if needed

## Troubleshooting

### Common Issues:
1. **API key not working**: Check if APIs are enabled and key is unrestricted during testing
2. **CORS errors**: Verify domain restrictions match your current domain
3. **No results**: Check if Places API (New) is enabled, not the legacy Places API

### Testing:
- Test with common mall names: "Mall of America", "Westfield", "Simon Malls"
- Test with store names: "Target", "Walmart", "Best Buy"
- Test with addresses: "123 Main St, New York, NY"

## Support
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)