# Places Cache System Testing Guide

## Overview
The Places Cache System has been implemented to reduce Google Places API usage and costs by automatically caching search results and selected places in the database.

## How It Works

### 1. **Cache-First Search Strategy**
- When you search for a place, the system first checks the local cache
- If cached results exist, they are returned immediately (Cache Hit)
- If no cached results exist, the system calls Google Places API (Cache Miss)
- New API results are automatically cached for future use

### 2. **Automatic Caching**
- **Search Results**: All Google Places search results are cached automatically
- **Selected Places**: When you select a place, detailed information is cached
- **Smart Updates**: Frequently searched places get higher priority

### 3. **Cost Optimization Features**
- **Session Tokens**: Proper session management for Google Places API
- **Intelligent Caching**: Avoids duplicate API calls for the same searches
- **Cache Statistics**: Development mode shows cache hit counts

## Testing Instructions

### Step 1: Initial Setup
1. Make sure your Google Places API key is configured in `.env.local`
2. Ensure the development server is running (`npm run dev`)
3. Navigate to the checkout page: `http://localhost:3000/checkout`

### Step 2: Test Cache Miss (First Search)
1. In the delivery address field, search for a mall: "westfield"
2. **Expected**: 
   - Console shows: "Cache miss for 'westfield', calling APIs..."
   - Results appear from Google Places API
   - Console shows: "Cached X Google Places results for 'westfield'"

### Step 3: Test Cache Hit (Repeat Search)
1. Clear the search field and search for "westfield" again
2. **Expected**:
   - Console shows: "Cache hit! Found X cached results for 'westfield'"
   - Results appear instantly (much faster)
   - Blue cache statistics badge appears (in development mode)

### Step 4: Test Place Selection Caching
1. Select a place from the search results
2. **Expected**:
   - Console shows: "Cached selected place: [Place Name]"
   - Place details are saved to cache

### Step 5: Test Cached Place Details
1. Search for the same place again and select it
2. **Expected**:
   - Console shows: "Used cached place details for: [Place Name]"
   - No additional Google Places API call for place details

### Step 6: Test Different Search Types
1. Test searching for:
   - Malls: "mall", "shopping center"
   - Stores: "store", "shop"
   - General addresses: "123 main street"
2. **Expected**: Each search type is cached separately

## Verification Points

### ✅ Cache Hit Indicators
- Console message: "Cache hit! Found X cached results"
- Faster search response time
- Blue cache statistics badge (development mode)
- Cache hit counter increments

### ✅ Cache Miss Indicators  
- Console message: "Cache miss for '[query]', calling APIs..."
- Console message: "Cached X Google Places results"
- Slower initial response (API call time)

### ✅ Database Verification
You can verify the cache is working by checking the `places_cache` table in Supabase:
1. Go to your Supabase dashboard
2. Navigate to Table Editor > places_cache
3. You should see cached search results with:
   - `search_query`: The search terms used
   - `search_type`: 'all', 'malls', or 'stores'
   - `place_id`: Google Places ID
   - `search_count`: Number of times searched
   - `last_searched_at`: Last search timestamp

## Expected Benefits

### 🚀 Performance Improvements
- **Instant Results**: Cached searches return immediately
- **Reduced Loading**: No API delays for repeated searches
- **Better UX**: Faster, more responsive address picking

### 💰 Cost Savings
- **Reduced API Calls**: Significant reduction in Google Places API usage
- **Smart Caching**: Popular places cached for maximum benefit
- **Session Management**: Proper token usage prevents unexpected charges

### 📊 Analytics
- **Cache Hit Rate**: Track how often cache is used vs API calls
- **Popular Searches**: Identify most searched locations
- **Usage Patterns**: Understand user search behavior

## Troubleshooting

### Cache Not Working?
1. Check console for error messages
2. Verify Supabase connection is working
3. Ensure database migration was applied successfully
4. Check if `places_cache` table exists in Supabase

### API Still Being Called?
1. Verify search queries are identical (case-insensitive matching)
2. Check if cache results exist for the search type
3. Ensure cache service is properly imported

### No Cache Statistics Showing?
1. Verify you're in development mode (`NODE_ENV=development`)
2. Perform at least one cache hit to see statistics
3. Check browser console for cache hit messages

## Cache Management

### Automatic Cleanup
- Old cache entries (30+ days, <3 searches) are automatically cleaned
- Cache size is managed to prevent excessive storage

### Manual Cache Management
You can use the cache service methods:
- `placesCacheService.getCacheStats()`: Get cache statistics
- `placesCacheService.cleanOldCache()`: Clean old entries
- `placesCacheService.searchCachedPlaces()`: Search cache directly

## Success Metrics

A successful implementation should show:
- **High Cache Hit Rate**: 60%+ for repeated searches
- **Reduced API Costs**: Significant decrease in Google Places API usage
- **Improved Performance**: Sub-100ms response for cached results
- **User Satisfaction**: Faster, more responsive address selection

---

**Note**: The cache system is designed to be transparent to users while providing significant cost and performance benefits. Monitor the console logs and cache statistics to verify proper operation.