import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Skip auth check for public routes
  const publicRoutes = ['/', '/login', '/signup', '/pricing', '/about']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/'))

  // Check if trying to access dashboard without auth
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If authenticated user tries to access login/signup, redirect to dashboard
  if (req.auth && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  // Exclude /api routes, static files, and images from middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
