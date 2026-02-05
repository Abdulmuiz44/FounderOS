import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // If authenticated user tries to access login/signup, redirect to dashboard
  if (req.auth && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  // Exclude /api routes, static files, and images from middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
