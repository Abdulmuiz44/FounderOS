import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login', // Redirect back to login page on error
        newUser: '/dashboard' // Redirect to dashboard after signup
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isPricing = nextUrl.pathname === '/pricing'

            // Public routes
            if (nextUrl.pathname === '/' ||
                nextUrl.pathname.startsWith('/blog') ||
                nextUrl.pathname === '/about' ||
                nextUrl.pathname === '/terms' ||
                nextUrl.pathname === '/privacy' ||
                nextUrl.pathname === '/pricing' ||
                nextUrl.pathname === '/login' ||
                nextUrl.pathname === '/signup') {
                return true
            }

            // Must be logged in for dashboard
            if (isOnDashboard) {
                if (isLoggedIn) return true
                return Response.redirect(new URL('/pricing', nextUrl))
            }

            // Default allow for other routes (like api) unless specified
            return true
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                // @ts-ignore
                session.user.githubUsername = token.githubUsername
                // @ts-ignore
                session.accessToken = token.accessToken
            }
            return session
        },
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.sub = user.id
            }
            // Store GitHub username and access token
            if (account?.provider === 'github') {
                if (profile) {
                    // @ts-ignore
                    token.githubUsername = profile.login
                }
                if (account.access_token) {
                    token.accessToken = account.access_token
                }
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
