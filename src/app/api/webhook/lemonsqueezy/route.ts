import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const clone = request.clone();
    const eventType = request.headers.get('X-Event-Name');
    const body = await request.json();
    
    // In production, verify signature here using request.headers.get('X-Signature')
    // const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    // const hmac = crypto.createHmac('sha256', secret);
    // const digest = Buffer.from(hmac.update(await clone.text()).digest('hex'), 'utf8');
    // const signature = Buffer.from(request.headers.get('X-Signature') || '', 'utf8');
    // if (!crypto.timingSafeEqual(digest, signature)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    const supabase = await createClient();

    if (eventType === 'order_created' || eventType === 'subscription_created') {
       const userId = body.meta.custom_data.user_id; // Pass user_id in custom_data from checkout
       const { id, attributes } = body.data;
       
       if (userId) {
         await supabase.from('subscriptions').upsert({
           user_id: userId,
           lemon_squeezy_id: id,
           order_id: attributes.order_number,
           status: attributes.status,
           renews_at: attributes.renews_at,
           created_at: attributes.created_at
         });
       }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
