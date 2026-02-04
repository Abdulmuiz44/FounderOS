import { handlers } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    console.log("🔹 [NextAuth] GET request to:", req.url);
    if (!handlers || !handlers.GET) {
        console.error("❌ [NextAuth] Handler not found!");
        return NextResponse.json({ error: "Auth handler missing" }, { status: 500 });
    }
    return handlers.GET(req as any);
}

export const POST = async (req: NextRequest) => {
    console.log("🔹 [NextAuth] POST request to:", req.url);
    if (!handlers || !handlers.POST) {
        console.error("❌ [NextAuth] Handler not found!");
        return NextResponse.json({ error: "Auth handler missing" }, { status: 500 });
    }
    return handlers.POST(req as any);
}
