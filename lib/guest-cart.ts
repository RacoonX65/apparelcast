const GUEST_CART_KEY = 'apparelcast_guest_cart'
const GUEST_CART_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export interface GuestCartItem {
  id: string
  productId: string
  quantity: number
  size?: string
  color?: string
  isBulkOrder?: boolean
  bulkTierId?: string
  originalPrice?: number
  bulkPrice?: number
  bulkSavings?: number
  specialOfferId?: string
  specialOfferPrice?: number
  addedAt: string
  updatedAt?: string
}

export interface GuestCart {
  items: GuestCartItem[]
  createdAt: string
  updatedAt: string
}

/**
 * Generate a unique ID for guest cart items
 */
function generateGuestCartItemId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get guest cart from localStorage
 */
export function getGuestCart(): GuestCart | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY)
    if (!stored) return null
    
    const cart = JSON.parse(stored) as GuestCart
    
    // Check if cart has expired
    const now = new Date().getTime()
    const cartAge = now - new Date(cart.createdAt).getTime()
    
    if (cartAge > GUEST_CART_EXPIRY) {
      localStorage.removeItem(GUEST_CART_KEY)
      return null
    }
    
    return cart
  } catch (error) {
    console.error('Error reading guest cart:', error)
    return null
  }
}

/**
 * Save guest cart to localStorage
 */
export function saveGuestCart(cart: GuestCart): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving guest cart:', error)
  }
}

/**
 * Add item to guest cart
 */
export function addToGuestCart(
  productId: string,
  quantity: number = 1,
  size?: string,
  color?: string,
  additionalData?: {
    isBulkOrder?: boolean
    bulkTierId?: string
    originalPrice?: number
    bulkPrice?: number
    bulkSavings?: number
    specialOfferId?: string
    specialOfferPrice?: number
  }
): GuestCartItem {
  const existingCart = getGuestCart() || {
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Check if item already exists (same product, size, color)
  const existingItem = existingCart.items.find(item => 
    item.productId === productId && 
    item.size === size && 
    item.color === color
  )
  
  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity
    existingItem.updatedAt = new Date().toISOString()
  } else {
    // Add new item
    const newItem: GuestCartItem = {
      id: generateGuestCartItemId(),
      productId,
      quantity,
      size,
      color,
      ...additionalData,
      addedAt: new Date().toISOString()
    }
    existingCart.items.push(newItem)
  }
  
  existingCart.updatedAt = new Date().toISOString()
  saveGuestCart(existingCart)
  
  return existingItem || existingCart.items[existingCart.items.length - 1]
}

/**
 * Remove item from guest cart
 */
export function removeFromGuestCart(itemId: string): boolean {
  const cart = getGuestCart()
  if (!cart) return false
  
  const initialLength = cart.items.length
  cart.items = cart.items.filter(item => item.id !== itemId)
  
  if (cart.items.length === initialLength) return false
  
  cart.updatedAt = new Date().toISOString()
  saveGuestCart(cart)
  return true
}

/**
 * Update item quantity in guest cart
 */
export function updateGuestCartQuantity(itemId: string, newQuantity: number): boolean {
  if (newQuantity <= 0) {
    return removeFromGuestCart(itemId)
  }
  
  const cart = getGuestCart()
  if (!cart) return false
  
  const item = cart.items.find(item => item.id === itemId)
  if (!item) return false
  
  item.quantity = newQuantity
  cart.updatedAt = new Date().toISOString()
  saveGuestCart(cart)
  return true
}

/**
 * Clear guest cart
 */
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_CART_KEY)
}

/**
 * Get guest cart item count
 */
export function getGuestCartCount(): number {
  const cart = getGuestCart()
  if (!cart) return 0
  
  return cart.items.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Get guest cart items (for checkout page)
 */
export function getGuestCartItems(): GuestCartItem[] {
  const cart = getGuestCart()
  return cart?.items || []
}

/**
 * Convert guest cart items to authenticated user cart
 * This should be called when user logs in
 */
export async function migrateGuestCartToUser(supabase: any, userId: string): Promise<void> {
  const guestCart = getGuestCart()
  if (!guestCart || guestCart.items.length === 0) return
  
  try {
    // Add each guest cart item to user's authenticated cart
    for (const item of guestCart.items) {
      // Check if item already exists in user's cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.productId)
        .eq('size', item.size)
        .eq('color', item.color)
        .single()
      
      if (existingItem) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
      } else {
        // Insert new item
        await supabase.from('cart_items').insert({
          user_id: userId,
          product_id: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          is_bulk_order: item.isBulkOrder,
          bulk_tier_id: item.bulkTierId,
          original_price: item.originalPrice,
          bulk_price: item.bulkPrice,
          bulk_savings: item.bulkSavings,
          special_offer_id: item.specialOfferId,
          special_offer_price: item.specialOfferPrice,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }
    
    // Clear guest cart after successful migration
    clearGuestCart()
    
  } catch (error) {
    console.error('Error migrating guest cart to user:', error)
    throw error
  }
}