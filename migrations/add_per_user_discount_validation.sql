-- Migration: Add per-user discount code validation
-- This migration updates the validate_discount_code function to prevent users from using the same discount code multiple times

-- Drop and recreate the validate_discount_code function with per-user usage checking
DROP FUNCTION IF EXISTS validate_discount_code(text, uuid, decimal);

CREATE OR REPLACE FUNCTION validate_discount_code(
  code_text text,
  user_uuid uuid,
  order_total decimal
)
RETURNS json AS $$
DECLARE
  discount_record public.discount_codes%rowtype;
  calculated_discount decimal;
  usage_count_current integer;
  user_usage_count integer;
  result json;
BEGIN
  -- Get discount code details
  SELECT * INTO discount_record
  FROM public.discount_codes
  WHERE code = code_text
  AND is_active = true
  AND (valid_from IS NULL OR valid_from <= now())
  AND (valid_until IS NULL OR valid_until > now());
  
  -- Check if code exists and is valid
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid or expired discount code'
    );
  END IF;
  
  -- Check if user has already used this discount code
  SELECT count(*) INTO user_usage_count
  FROM public.discount_usage
  WHERE discount_code_id = discount_record.id
  AND user_id = user_uuid;
  
  IF user_usage_count > 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'You have already used this discount code'
    );
  END IF;
  
  -- Check minimum order amount
  IF order_total < discount_record.minimum_order_amount THEN
    RETURN json_build_object(
      'valid', false,
      'error', format('Minimum order amount is $%.2f', discount_record.minimum_order_amount)
    );
  END IF;
  
  -- Check usage limit
  IF discount_record.usage_limit IS NOT NULL THEN
    SELECT usage_count INTO usage_count_current
    FROM public.discount_codes
    WHERE id = discount_record.id;
    
    IF usage_count_current >= discount_record.usage_limit THEN
      RETURN json_build_object(
        'valid', false,
        'error', 'Discount code usage limit reached'
      );
    END IF;
  END IF;
  
  -- Calculate discount amount
  IF discount_record.discount_type = 'percentage' THEN
    calculated_discount = order_total * (discount_record.discount_value / 100);
    -- Apply maximum discount limit if set
    IF discount_record.maximum_discount_amount IS NOT NULL THEN
      calculated_discount = least(calculated_discount, discount_record.maximum_discount_amount);
    END IF;
  ELSE
    calculated_discount = discount_record.discount_value;
  END IF;
  
  -- Ensure discount doesn't exceed order total
  calculated_discount = least(calculated_discount, order_total);
  
  RETURN json_build_object(
    'valid', true,
    'discount_id', discount_record.id,
    'discount_amount', calculated_discount,
    'discount_type', discount_record.discount_type,
    'discount_value', discount_record.discount_value
  );
END;
$$ LANGUAGE plpgsql;