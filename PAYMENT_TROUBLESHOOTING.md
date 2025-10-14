# Payment Status Troubleshooting Guide

If your payment status is stuck on "pending" after successful Paystack payment, follow this guide to diagnose and fix the issue.

---

## Quick Checklist

- [ ] Paystack public key is set in environment variables
- [ ] Paystack script is loading on the page
- [ ] Browser console shows no errors
- [ ] Server action is being called in the callback
- [ ] RLS policies allow order updates
- [ ] Database connection is working

---

## Step 1: Verify Paystack Configuration

### Check Environment Variable
1. Go to the **Vars** section in the v0 sidebar
2. Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` exists and has your test/live public key
3. The key should start with `pk_test_` (test) or `pk_live_` (production)

### Check Paystack Script Loading
1. Open your checkout page
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for: `[v0] Paystack script loaded successfully`
5. If you see `[v0] Paystack script failed to load`, the script isn't loading

**Fix:** Check your internet connection or Paystack service status

---

## Step 2: Test the Payment Flow

### Monitor the Console During Payment
1. Open checkout page with items in cart
2. Open browser DevTools (F12) → **Console** tab
3. Click "Pay with Paystack"
4. Complete a test payment
5. Watch for these console messages in order:

\`\`\`
[v0] Paystack script loaded successfully
[v0] Initiating Paystack payment for order: [order-id]
[v0] Payment successful, reference: [reference]
[v0] Calling server action to verify payment
[v0] Server action response: {...}
\`\`\`

### What Each Message Means

**✅ `[v0] Paystack script loaded successfully`**
- Paystack is ready to process payments

**✅ `[v0] Initiating Paystack payment for order: [order-id]`**
- Order created successfully, payment window opening

**✅ `[v0] Payment successful, reference: [reference]`**
- Paystack confirmed payment, callback triggered

**✅ `[v0] Calling server action to verify payment`**
- About to update order status in database

**✅ `[v0] Server action response: {...}`**
- Order status update completed

---

## Step 3: Identify Where It's Failing

### Issue: No Console Messages at All
**Problem:** JavaScript isn't running or page isn't loading properly

**Fix:**
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for any red errors

---

### Issue: Script Fails to Load
**Console shows:** `[v0] Paystack script failed to load`

**Problem:** Paystack CDN is blocked or unavailable

**Fix:**
1. Check your internet connection
2. Disable ad blockers or privacy extensions
3. Try a different browser
4. Check if `https://js.paystack.co/v1/inline.js` is accessible

---

### Issue: Payment Window Doesn't Open
**Console shows:** `SecurityError` or `Paystack is not defined`

**Problem:** Browser security settings or script not loaded

**Fix:**
1. Ensure popups are allowed for your site
2. Wait a few seconds after page load before clicking "Pay"
3. Check if `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set correctly
4. Verify the Paystack script loaded (see Step 2)

---

### Issue: Payment Successful but Status Stays "Pending"
**Console shows:** Payment successful message but no server action response

**Problem:** Server action isn't being called or is failing

**Fix:**

#### A. Check if Server Action is Being Called
Look for: `[v0] Calling server action to verify payment`

**If you DON'T see this:**
- The callback function isn't executing
- Check browser console for JavaScript errors
- Verify the checkout-client.tsx file has the correct callback

**If you DO see this but no response:**
- The server action is failing
- Continue to Step 4

---

## Step 4: Check Server Action

### Verify Server Action Exists
1. Check that `app/actions/orders.ts` file exists
2. Verify it exports `verifyPaymentAndUpdateOrder` function

### Test Server Action Manually
Add this temporary code to your checkout page to test:

\`\`\`typescript
// Temporary test - remove after debugging
const testServerAction = async () => {
  const result = await verifyPaymentAndUpdateOrder('test-order-id', 'test-reference')
  console.log('[v0] Test result:', result)
}
\`\`\`

**If you get an error:**
- Check the error message in console
- Verify Supabase connection is working
- Check RLS policies (see Step 5)

---

## Step 5: Verify Database & RLS Policies

### Check if Order Was Created
1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → **orders** table
3. Find your order by order_number
4. Check the `payment_status` and `status` columns

**If order doesn't exist:**
- Order creation failed before payment
- Check cart_items table has items
- Verify user is authenticated

**If order exists with "pending" status:**
- Payment callback didn't update the order
- Continue checking RLS policies below

### Verify RLS Policies Allow Updates

Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Check if your user can update orders
SELECT * FROM orders WHERE id = 'your-order-id';

-- Try to update manually
UPDATE orders 
SET payment_status = 'paid', status = 'processing' 
WHERE id = 'your-order-id';
\`\`\`

**If UPDATE fails:**
- RLS policies are blocking the update
- Run the database scripts again (001, 002, 004)
- Verify you're logged in as the order owner

---

## Step 6: Common Issues & Solutions

### Issue: "Failed to update order status"
**Cause:** RLS policy blocking update or database connection issue

**Solution:**
1. Re-run database scripts in order:
   \`\`\`
   001_create_tables.sql
   002_create_profile_trigger.sql
   004_add_admin_role.sql
   \`\`\`
2. Verify your user profile exists in `profiles` table
3. Check Supabase connection in environment variables

---

### Issue: Order Shows in Database but Not in "My Orders"
**Cause:** RLS policy blocking SELECT or user_id mismatch

**Solution:**
1. Check the `user_id` in the orders table matches your auth user ID
2. Run this SQL to verify:
   \`\`\`sql
   SELECT auth.uid() as my_user_id, 
          (SELECT user_id FROM orders WHERE id = 'your-order-id') as order_user_id;
   \`\`\`
3. If they don't match, the order was created with wrong user_id

---

### Issue: Multiple Orders Created for Same Payment
**Cause:** User clicking "Pay" multiple times

**Solution:**
1. Add a loading state to prevent double-clicks (already implemented)
2. Delete duplicate orders from database:
   \`\`\`sql
   DELETE FROM orders 
   WHERE payment_status = 'pending' 
   AND created_at < NOW() - INTERVAL '1 hour';
   \`\`\`

---

## Step 7: Enable Detailed Logging

If you're still having issues, add more detailed logging:

### In checkout-client.tsx, add:

\`\`\`typescript
console.log('[v0] Order created:', order)
console.log('[v0] User ID:', user?.id)
console.log('[v0] Payment reference:', response.reference)
\`\`\`

### In app/actions/orders.ts, add:

\`\`\`typescript
console.log('[v0] Server action called with:', { orderId, paymentReference })
console.log('[v0] Update result:', { data, error })
\`\`\`

This will help you see exactly where the flow is breaking.

---

## Step 8: Manual Fix (Last Resort)

If payment was successful but status didn't update, manually fix in database:

\`\`\`sql
-- Find your order
SELECT * FROM orders WHERE order_number = 'YOUR_ORDER_NUMBER';

-- Update status manually
UPDATE orders 
SET 
  payment_status = 'paid',
  status = 'processing',
  payment_reference = 'YOUR_PAYSTACK_REFERENCE'
WHERE id = 'YOUR_ORDER_ID';
\`\`\`

---

## Prevention: Best Practices

1. **Always test in Paystack test mode first**
   - Use test cards: 4084084084084081 (success)
   - Verify the flow works before going live

2. **Monitor your console during checkout**
   - Keep DevTools open during testing
   - Watch for errors or missing log messages

3. **Set up proper error tracking**
   - Consider adding Sentry or similar service
   - Log all payment failures to database

4. **Test the full flow regularly**
   - Create test order → Pay → Verify status updates
   - Check both user view and admin view

---

## Still Having Issues?

If you've followed all steps and still have problems:

1. **Check Paystack Dashboard**
   - Go to paystack.com dashboard
   - Verify the payment was received
   - Check the payment reference matches your order

2. **Check Supabase Logs**
   - Go to Supabase dashboard → Logs
   - Look for errors around the time of payment

3. **Verify All Scripts Ran Successfully**
   - Re-run all database scripts in order
   - Check for any SQL errors

4. **Test with a Fresh Order**
   - Clear your cart
   - Add new items
   - Try the payment flow again

---

## Quick Debug Checklist

Copy this checklist and check off as you verify:

\`\`\`
Payment Flow Debug Checklist:
□ NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is set
□ Paystack script loads (check console)
□ Order is created (check database)
□ Payment window opens
□ Payment completes successfully
□ Callback function executes (check console)
□ Server action is called (check console)
□ Order status updates in database
□ Cart is cleared
□ Redirect to confirmation page works
□ Order shows in "My Orders" page
\`\`\`

---

## Contact Support

If none of these solutions work, you may have a unique configuration issue. Gather this information:

- Browser and version
- Console error messages (screenshots)
- Order ID from database
- Paystack payment reference
- Environment (development/production)

This will help diagnose the specific issue with your setup.
