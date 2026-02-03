import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        const { email, password, fullName } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Check if user exists
        const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        const passwordHash = await hash(password, 10)

        // Insert user
        const { error } = await supabase.from("users").insert({
            email,
            password_hash: passwordHash,
            name: fullName,
            full_name: fullName,
        })

        if (error) {
            console.error("Supabase error:", error)
            throw error
        }

        return NextResponse.json({ success: true })

    } catch (e: any) {
        console.error("Registration error:", e)
        return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 })
    }
}
