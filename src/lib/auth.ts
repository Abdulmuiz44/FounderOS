import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { compare } from "bcryptjs"
import { createClient } from "@supabase/supabase-js"
import { authConfig } from "./auth.config"

// Initialize Supabase client for credentials lookup
const getSupabaseClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        // Email/Password Credentials Provider
        Credentials({
            id: "credentials",
            name: "Email & Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const email = credentials.email as string
                const password = credentials.password as string

                try {
                    const supabase = getSupabaseClient()

                    const { data: user, error } = await supabase
                        .from("users")
                        .select("*")
                        .eq("email", email.toLowerCase())
                        .single()

                    if (error || !user) {
                        console.log("LOGIN DEBUG: User not found in Supabase:", email, error)
                        return null
                    }

                    if (!user.password_hash) {
                        console.log("LOGIN DEBUG: No password_hash for user:", email)
                        return null
                    }

                    const isValid = await compare(password, user.password_hash)

                    if (!isValid) {
                        console.log("LOGIN DEBUG: Password mismatch for user:", email)
                        return null
                    }

                    console.log("LOGIN DEBUG: Login successful for:", email)

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || user.full_name,
                        image: user.image || user.avatar_url,
                    }
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            }
        })
    ],
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
    debug: process.env.NODE_ENV === 'development',
})
