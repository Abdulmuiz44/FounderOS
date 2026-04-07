import { handleLemonSqueezyWebhook } from '@/lib/webhooks/lemonsqueezy';

export async function POST(request: Request) {
  return handleLemonSqueezyWebhook(request, { strictSignature: true });
}
