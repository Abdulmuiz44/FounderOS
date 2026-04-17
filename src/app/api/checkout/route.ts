import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { configureLemonSqueezy } from "@/utils/lemonsqueezy";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        configureLemonSqueezy();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const body = await req.json();
        const { variantId } = body;

        const storeId = process.env.LEMONSQUEEZY_STORE_ID;

        if (!storeId) {
            console.error("LEMONSQUEEZY_STORE_ID is not defined");
            return NextResponse.json({ error: "Store ID not configured" }, { status: 500 });
        }

        if (!variantId) {
            return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
        }

        // Default checkout options
        const checkoutOptions: any = {
            checkoutOptions: {
                dark: true,
                media: false, // Don't show product image if preferred
            },
            productOptions: {
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                receiptButtonText: 'Go to Dashboard',
                receiptThankYouNote: 'Thank you for joining FounderOS!'
            }
        };

        // If user is logged in, pre-fill email and attach user_id
        if (user) {
            checkoutOptions.checkoutData = {
                email: user.email,
                custom: {
                    user_id: user.id,
                },
            };
        }

        const checkout = await createCheckout(
            storeId,
            variantId,
            checkoutOptions
        );

        const checkoutUrl = checkout.data?.data.attributes.url;

        if (!checkoutUrl) {
            throw new Error("Failed to generate checkout URL");
        }

        return NextResponse.json({ url: checkoutUrl });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
