-- Create subscriptions table for Lemon Squeezy integration
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lemon_subscription_id text unique,
  customer_id text,
  variant_id text,
  plan_name text, -- 'Starter' or 'Pro' for easier querying
  status text check (status in ('active', 'past_due', 'unpaid', 'cancelled', 'expired', 'on_trial', 'paused')),
  renews_at timestamp with time zone,
  ends_at timestamp with time zone,
  update_payment_method_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policies
create policy "Users can view own subscription" 
  on public.subscriptions 
  for select 
  using (auth.uid() = user_id);

-- Only service role can insert/update/delete via webhooks
create policy "Service role can manage all subscriptions"
  on public.subscriptions
  using (true)
  with check (true);

-- Indexes for performance
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_lemon_id on public.subscriptions(lemon_subscription_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

-- Optional: Add trigger for updated_at if not handled by application logic
-- (Assuming application logic or another mechanism handles updated_at, but good to have)
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.subscriptions
  for each row execute procedure moddatetime (updated_at);
