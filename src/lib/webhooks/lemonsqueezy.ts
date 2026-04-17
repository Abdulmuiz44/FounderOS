import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

type LemonSqueezyWebhookOptions = {
  strictSignature?: boolean;
};

function mapPlanName(variantId: unknown) {
  const variant = variantId?.toString?.() ?? String(variantId ?? '');

  if (variant === process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_STARTER) return 'Starter';
  if (variant === process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_PRO) return 'Pro';

  return null;
}

export async function handleLemonSqueezyWebhook(request: Request, options: LemonSqueezyWebhookOptions = {}) {
  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
  const signature = request.headers.get('x-signature') || request.headers.get('X-Signature') || '';

  if (options.strictSignature && !secret) {
    return Response.json({ error: 'Server config error' }, { status: 500 });
  }

  if (secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);
  const { meta = {}, data = {} } = payload;
  const eventName = meta.event_name || request.headers.get('X-Event-Name') || request.headers.get('x-event-name');
  const customData = meta.custom_data || {};
  const userId = customData.user_id;

  if (!eventName) {
    return Response.json({ error: 'Missing event name' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  if (eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'order_created') {
    const attributes = data.attributes || {};
    const subscriptionId = data.id?.toString?.() ?? String(data.id ?? '');

    if (!userId) {
      return Response.json({ received: true, warning: 'Missing user_id in webhook payload' });
    }

    const subscriptionData = {
      user_id: userId,
      lemon_subscription_id: subscriptionId,
      customer_id: attributes.customer_id?.toString?.() ?? null,
      variant_id: attributes.variant_id?.toString?.() ?? null,
      plan_name: mapPlanName(attributes.variant_id),
      status: attributes.status ?? null,
      renews_at: attributes.renews_at ?? null,
      ends_at: attributes.ends_at ?? null,
      update_payment_method_url: attributes.urls?.update_payment_method ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'lemon_subscription_id' });

    if (error) {
      return Response.json({ error: 'Database error' }, { status: 500 });
    }
  }

  if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
    const attributes = data.attributes || {};

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: attributes.status ?? null,
        ends_at: attributes.ends_at ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('lemon_subscription_id', data.id);

    if (error) {
      return Response.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
