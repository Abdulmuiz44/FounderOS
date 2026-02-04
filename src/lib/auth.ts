import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { compare } from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email as string
                const password = credentials.password as string

                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                )

                const { data: user } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", email)
                    .single()

                if (!user || !user.password_hash) return null

                // Check if email is verified
                // Note: supabase-adapter might store it as "emailVerified" (timestamp) or we might have inconsistent casing
                // Let's check loosely.
                if (!user.emailVerified && !user["emailVerified"]) {
                    console.log("Email verification failed for:", email, user);
                    throw new Error("Email not verified")
                }

                const isValid = await compare(password, user.password_hash)

                if (!isValid) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name || user.full_name,
                    image: user.image || user.avatar_url,
                }
            }
        })
    ],
    // Adapter enabled for user persistence (OAuth)
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
            }
            return token
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
    },
    debug: true,
})
