-- Promote abdulmuizproject@gmail.com to Pro Plan
-- Also set up as a template for promoting users to Pro

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id 
    FROM public.users 
    WHERE email = 'abdulmuizproject@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- Insert or update subscription to Pro
        INSERT INTO public.subscriptions (
            user_id,
            plan_name,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            created_at,
            updated_at
        ) VALUES (
            target_user_id,
            'Pro',
            'pro-plan',
            'active',
            NOW(),
            NOW() + INTERVAL '1 year', -- 1 year validity
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            plan_name = 'Pro',
            plan_id = 'pro-plan',
            status = 'active',
            current_period_start = NOW(),
            current_period_end = NOW() + INTERVAL '1 year',
            updated_at = NOW();

        RAISE NOTICE 'User % promoted to Pro successfully', 'abdulmuizproject@gmail.com';
    ELSE
        RAISE WARNING 'User % not found', 'abdulmuizproject@gmail.com';
    END IF;
END $$;
