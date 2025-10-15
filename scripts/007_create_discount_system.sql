-- Create discount codes table
create table if not exists public.discount_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed_amount')),
  discount_value decimal(10,2) not null check (discount_value > 0),
  minimum_order_amount decimal(10,2) default 0,
  maximum_discount_amount decimal(10,2), -- For percentage discounts
  usage_limit integer, -- null means unlimited
  usage_count integer default 0,
  is_active boolean default true,
  valid_from timestamp with time zone default now(),
  valid_until timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id)
);

-- Create discount usage tracking table
create table if not exists public.discount_usage (
  id uuid primary key default uuid_generate_v4(),
  discount_code_id uuid references public.discount_codes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade,
  discount_amount decimal(10,2) not null,
  used_at timestamp with time zone default now(),
  unique(discount_code_id, user_id, order_id) -- Prevent duplicate usage per order
);

-- Create indexes for better performance
create index if not exists idx_discount_codes_code on public.discount_codes(code);
create index if not exists idx_discount_codes_active on public.discount_codes(is_active);
create index if not exists idx_discount_codes_valid_dates on public.discount_codes(valid_from, valid_until);
create index if not exists idx_discount_usage_code_id on public.discount_usage(discount_code_id);
create index if not exists idx_discount_usage_user_id on public.discount_usage(user_id);
create index if not exists idx_discount_usage_order_id on public.discount_usage(order_id);

-- Enable Row Level Security
alter table public.discount_codes enable row level security;
alter table public.discount_usage enable row level security;

-- Discount codes policies
-- Anyone can view active discount codes (for validation)
create policy "Anyone can view active discount codes"
  on public.discount_codes for select
  using (is_active = true and (valid_until is null or valid_until > now()));

-- Only admins can create discount codes
create policy "Admins can create discount codes"
  on public.discount_codes for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Only admins can update discount codes
create policy "Admins can update discount codes"
  on public.discount_codes for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Only admins can delete discount codes
create policy "Admins can delete discount codes"
  on public.discount_codes for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Discount usage policies
-- Users can view their own discount usage
create policy "Users can view own discount usage"
  on public.discount_usage for select
  using (auth.uid() = user_id);

-- System can create discount usage records (for orders)
create policy "System can create discount usage"
  on public.discount_usage for insert
  with check (auth.uid() = user_id);

-- Admins can view all discount usage
create policy "Admins can view all discount usage"
  on public.discount_usage for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Function to update updated_at timestamp for discount codes
create or replace function update_discount_codes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at for discount codes
create trigger update_discount_codes_timestamp
  before update on public.discount_codes
  for each row
  execute function update_discount_codes_updated_at();

-- Function to validate and apply discount code
create or replace function validate_discount_code(
  code_text text,
  user_uuid uuid,
  order_total decimal
)
returns json as $$
declare
  discount_record public.discount_codes%rowtype;
  calculated_discount decimal;
  usage_count_current integer;
  user_usage_count integer;
  result json;
begin
  -- Get discount code details
  select * into discount_record
  from public.discount_codes
  where code = code_text
  and is_active = true
  and (valid_from is null or valid_from <= now())
  and (valid_until is null or valid_until > now());
  
  -- Check if code exists and is valid
  if not found then
    return json_build_object(
      'valid', false,
      'error', 'Invalid or expired discount code'
    );
  end if;
  
  -- Check if user has already used this discount code
  select count(*) into user_usage_count
  from public.discount_usage
  where discount_code_id = discount_record.id
  and user_id = user_uuid;
  
  if user_usage_count > 0 then
    return json_build_object(
      'valid', false,
      'error', 'You have already used this discount code'
    );
  end if;
  
  -- Check minimum order amount
  if order_total < discount_record.minimum_order_amount then
    return json_build_object(
      'valid', false,
      'error', format('Minimum order amount is $%.2f', discount_record.minimum_order_amount)
    );
  end if;
  
  -- Check usage limit
  if discount_record.usage_limit is not null then
    select usage_count into usage_count_current
    from public.discount_codes
    where id = discount_record.id;
    
    if usage_count_current >= discount_record.usage_limit then
      return json_build_object(
        'valid', false,
        'error', 'Discount code usage limit reached'
      );
    end if;
  end if;
  
  -- Calculate discount amount
  if discount_record.discount_type = 'percentage' then
    calculated_discount = order_total * (discount_record.discount_value / 100);
    -- Apply maximum discount limit if set
    if discount_record.maximum_discount_amount is not null then
      calculated_discount = least(calculated_discount, discount_record.maximum_discount_amount);
    end if;
  else
    calculated_discount = discount_record.discount_value;
  end if;
  
  -- Ensure discount doesn't exceed order total
  calculated_discount = least(calculated_discount, order_total);
  
  return json_build_object(
    'valid', true,
    'discount_id', discount_record.id,
    'discount_amount', calculated_discount,
    'discount_type', discount_record.discount_type,
    'discount_value', discount_record.discount_value
  );
end;
$$ language plpgsql;

-- Function to apply discount and update usage count
create or replace function apply_discount_code(
  discount_id_param uuid,
  user_uuid uuid,
  order_uuid uuid,
  discount_amount_param decimal
)
returns boolean as $$
begin
  -- Insert usage record
  insert into public.discount_usage (discount_code_id, user_id, order_id, discount_amount)
  values (discount_id_param, user_uuid, order_uuid, discount_amount_param);
  
  -- Update usage count
  update public.discount_codes
  set usage_count = usage_count + 1
  where id = discount_id_param;
  
  return true;
exception
  when others then
    return false;
end;
$$ language plpgsql;