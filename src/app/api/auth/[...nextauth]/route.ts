import { handlers } from "@/lib/auth"
import { NextRequest } from "next/server"

export const GET = async (req: NextRequest) => {
    console.log("🔹 [NextAuth] GET request to:", req.url);
    return handlers.GET(req as any);
}

export const POST = async (req: NextRequest) => {
    console.log("🔹 [NextAuth] POST request to:", req.url);
    return handlers.POST(req as any);
}
