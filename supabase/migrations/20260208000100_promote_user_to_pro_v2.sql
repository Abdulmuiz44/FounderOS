-- Simpler migration: Promote abdulmuizproject@gmail.com to Pro Plan
-- Insert Pro subscription for the user

INSERT INTO public.subscriptions (
    user_id,
    plan_name,
    status,
    current_period_start,
    current_period_end,
    renews_at,
    created_at,
    updated_at
)
SELECT 
    id as user_id,
    'Pro' as plan_name,
    'active' as status,
    NOW() as current_period_start,
    NOW() + INTERVAL '1 year' as current_period_end,
    NOW() + INTERVAL '1 year' as renews_at,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users
WHERE email = 'abdulmuizproject@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET
    plan_name = 'Pro',
    status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 year',
    renews_at = NOW() + INTERVAL '1 year',
    updated_at = NOW();
