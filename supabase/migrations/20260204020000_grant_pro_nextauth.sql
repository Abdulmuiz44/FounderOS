-- Give Pro access to abdulmuizproject@gmail.com (NextAuth users table)
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Look up user by email from public.users (NextAuth)
  SELECT id INTO target_user_id FROM public.users WHERE email = 'abdulmuizproject@gmail.com';

  IF target_user_id IS NOT NULL THEN
    -- 1. Cancel any existing active subscriptions for this user to avoid duplicates
    UPDATE public.subscriptions 
    SET status = 'cancelled' 
    WHERE user_id = target_user_id AND status = 'active';

    -- 2. Insert new Pro subscription (Lifetime/Manual)
    INSERT INTO public.subscriptions (
      user_id,
      status,
      plan_name,
      variant_id,
      lemon_subscription_id,
      customer_id,
      renews_at,
      created_at,
      updated_at
    ) VALUES (
      target_user_id,
      'active',
      'Pro',
      'manual_admin_override', 
      'manual_' || substr(md5(random()::text), 1, 10),
      'admin_granted',
      now() + interval '100 years', -- Effectively lifetime
      now(),
      now()
    );
    
    RAISE NOTICE 'Granted Pro access to user ID: %', target_user_id;
  ELSE
    RAISE NOTICE 'User abdulmuizproject@gmail.com not found in public.users table.';
  END IF;
END $$;
