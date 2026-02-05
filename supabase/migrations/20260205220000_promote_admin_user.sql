-- Give founderos.live@gmail.com Pro access manually
-- This effectively makes them an "admin" in terms of feature access

DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id FROM public.users WHERE email = 'founderos.live@gmail.com';

    -- If user exists, upsert subscription
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (
            user_id,
            status,
            plan_name,
            variant_id,
            lemon_subscription_id,
            renews_at,
            ends_at,
            created_at,
            updated_at
        ) VALUES (
            target_user_id,
            'active',
            'Pro',
            'manual_admin_grant',
            'manual_' || target_user_id, -- distinct fake ID
            now() + interval '100 years',
            now() + interval '100 years',
            now(),
            now()
        )
        ON CONFLICT (lemon_subscription_id) 
        DO UPDATE SET
            status = 'active',
            plan_name = 'Pro',
            renews_at = EXCLUDED.renews_at,
            ends_at = EXCLUDED.ends_at,
            updated_at = now();
            
        RAISE NOTICE 'User founderos.live@gmail.com promoted to Pro.';
    ELSE
        RAISE NOTICE 'User founderos.live@gmail.com not found. Please sign up first.';
    END IF;
END $$;
