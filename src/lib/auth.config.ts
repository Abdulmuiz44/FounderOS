import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                // @ts-ignore - add github username if available
                session.user.githubUsername = token.githubUsername
            }
            return session
        },
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.sub = user.id
            }
            // Store GitHub username for build tracking
            if (account?.provider === 'github' && profile) {
                // @ts-ignore
                token.githubUsername = profile.login
            }
            return token
        },
        async redirect({ url, baseUrl }) {
            // Always redirect to dashboard after successful sign in
            if (url.startsWith(baseUrl)) return url
            if (url.startsWith('/')) return `${baseUrl}${url}`
            return `${baseUrl}/dashboard`
        }
    },
    session: {
        strategy: "jwt",
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    trustHost: true,
    providers: [],
} satisfies NextAuthConfig
