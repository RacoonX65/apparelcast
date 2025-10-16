# PEP Send Integration Documentation

## Overview
This document outlines the PEP Send delivery option integration in the ApparelCast e-commerce application. The integration includes location selection, bulk order restrictions, and is structured for easy transition from mock data to real PEP API integration.

## Features Implemented

### 1. PEP Location Picker Component
- **File**: `components/pep-location-picker.tsx`
- **Features**:
  - Advanced search with text, province, and distance filtering
  - GPS-based location detection and distance sorting
  - Pagination for handling large datasets (10 locations per page)
  - Loading states and error handling
  - Collapsible filter interface
  - Real-time search with debouncing

### 2. Enhanced Search Functionality
- **File**: `lib/pep-locations.ts`
- **Functions**:
  - `advancedSearchPepLocations()` - Multi-criteria search
  - `getLocationsByProvince()` - Province-based filtering
  - `getAllProvinces()` - Get unique provinces list
  - `calculateDistance()` - GPS distance calculation

### 3. API Abstraction Layer
- **File**: `lib/pep-api.ts`
- **Features**:
  - Singleton service pattern
  - Response caching (5-minute TTL)
  - Error handling and retries
  - Pagination support
  - Easy switch between mock and real API

### 4. Checkout Integration
- **File**: `components/checkout-form.tsx`
- **Features**:
  - PEP Send as delivery option (R55)
  - Bulk order detection and restriction
  - Location validation
  - Warning messages for restricted orders

## Data Structure

### PEP Location Object
```typescript
interface PepLocation {
  id: string
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  phone: string
  coordinates: {
    lat: number
    lng: number
  }
  operatingHours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  services: string[]
}
```

### Current Mock Data
- 37 locations across all 9 South African provinces
- Major cities and towns covered
- Realistic operating hours and contact information
- Service types: Collection, Returns, Customer Service

## Bulk Order Restrictions

### Definition
- Bulk orders are defined as any cart item with quantity >= 10
- PEP Send is automatically disabled for bulk orders
- Users see a warning message explaining the restriction

### Implementation
```typescript
const hasBulkOrders = cartItems.some(item => item.quantity >= 10)
const availableDeliveryOptions = DELIVERY_OPTIONS.filter(option => 
  !hasBulkOrders || option.id !== "pep_send"
)
```

## API Integration Roadmap

### Phase 1: Mock Implementation ✅
- Static location data
- Client-side search and filtering
- Simulated API responses

### Phase 2: Hybrid Approach (Ready)
- API service layer implemented
- Easy toggle between mock and real data
- Caching and error handling ready

### Phase 3: Full API Integration (Future)
To switch to real PEP API:

1. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_PEP_API_URL=https://api.pep.co.za
   PEP_API_KEY=your_api_key_here
   ```

2. **Enable API Service**:
   In `pep-location-picker.tsx`, uncomment the API service code:
   ```typescript
   // Change from Option 2 to Option 1
   const response = await pepApi.searchLocations({...})
   ```

3. **Update API Service**:
   Replace `simulateApiCall()` with real HTTP requests in `pep-api.ts`

## Performance Considerations

### Current Optimizations
- Client-side pagination (10 items per page)
- Search debouncing (300ms delay)
- Response caching (5 minutes)
- Lazy loading of location data

### Future Optimizations
- Server-side pagination
- Infinite scroll for mobile
- Location clustering for map view
- Service worker caching

## Testing Checklist

### Functional Testing
- [ ] Search by city name
- [ ] Search by province
- [ ] GPS location detection
- [ ] Distance-based sorting
- [ ] Province filtering
- [ ] Pagination navigation
- [ ] Location selection
- [ ] Bulk order restriction
- [ ] Form validation

### Performance Testing
- [ ] Large dataset handling (100+ locations)
- [ ] Search response time
- [ ] Memory usage with pagination
- [ ] Mobile responsiveness

### Error Handling
- [ ] GPS permission denied
- [ ] Network connectivity issues
- [ ] Invalid search queries
- [ ] API timeout scenarios

## Maintenance Notes

### Adding New Locations
1. Update `PEP_LOCATIONS` array in `lib/pep-locations.ts`
2. Ensure proper province categorization
3. Validate coordinates accuracy
4. Test search functionality

### Modifying Search Logic
- Update `advancedSearchPepLocations()` function
- Consider performance impact on large datasets
- Test edge cases (empty queries, special characters)

### API Integration Changes
- Update `PepApiService` class methods
- Modify response type interfaces
- Update error handling logic
- Test with real API endpoints

## Dependencies

### UI Components
- `@/components/ui/*` - Shadcn/ui components
- `lucide-react` - Icons

### Utilities
- Browser Geolocation API
- JavaScript Math functions for distance calculation

### Future Dependencies (API Integration)
- HTTP client (fetch/axios)
- Authentication tokens
- Rate limiting utilities

## Support and Troubleshooting

### Common Issues
1. **GPS not working**: Check browser permissions
2. **Slow search**: Implement debouncing
3. **Large datasets**: Enable pagination
4. **API errors**: Check network and API keys

### Debug Mode
Enable console logging by setting:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development'
```

### Contact Information
For PEP API integration support, contact PEP technical team with:
- API documentation requirements
- Authentication setup
- Rate limiting information
- Webhook configurations