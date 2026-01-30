import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-signature') || '';
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

        // If no secret is set, we can't verify, so for security we should fail.
        // But for dev testing without secret (if user skips it), we might want to allow?
        // No, secure by default.
        if (!secret) {
            console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set');
            return NextResponse.json({ error: 'Server config error' }, { status: 500 });
        }

        // Verify signature
        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const { meta, data } = payload;
        const eventName = meta.event_name;
        const customData = meta.custom_data || {};
        const userId = customData.user_id;

        console.log(`Received webhook: ${eventName}`, { userId, lemonIds: data.id });

        // Initialize Supabase Admin Client (Service Role)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
            const attributes = data.attributes;

            // Map variant ID to Plan Name
            const variantId = attributes.variant_id.toString();
            let planName = null;
            if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_STARTER) planName = 'Starter';
            if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_PRO) planName = 'Pro';

            // If receiving subscription_updated, we might rely on existing user_id in DB if not present in webhook
            // But Lemon Squeezy usually preserves custom_data.

            if (!userId) {
                console.error(`Missing user_id in webhook for ${eventName}`);
                // If it's an update, we technically could find the sub by lemon_id, but if it's create, we are stuck.
                // We accept that we can't link un-authed purchases automatically without email matching logic.
                return NextResponse.json({ error: 'No user_id provided' }, { status: 200 }); // Return 200 to acknowledge receipt
            }

            const subscriptionData = {
                user_id: userId,
                lemon_subscription_id: data.id,
                customer_id: attributes.customer_id.toString(),
                variant_id: variantId,
                plan_name: planName,
                status: attributes.status,
                renews_at: attributes.renews_at,
                ends_at: attributes.ends_at,
                update_payment_method_url: attributes.urls?.update_payment_method,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabaseAdmin
                .from('subscriptions')
                .upsert(subscriptionData, { onConflict: 'lemon_subscription_id' });

            if (error) {
                console.error('Supabase Upsert Error:', error);
                return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }

        } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
            const attributes = data.attributes;

            const { error } = await supabaseAdmin
                .from('subscriptions')
                .update({
                    status: attributes.status,
                    ends_at: attributes.ends_at,
                    updated_at: new Date().toISOString()
                })
                .eq('lemon_subscription_id', data.id);

            if (error) {
                console.error('Supabase Update Error:', error);
                return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook Handler Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
