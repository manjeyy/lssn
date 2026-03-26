import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_AUTH_ROUTES = new Set(['/login', '/register'])
const PROTECTED_PREFIXES = ['/dashboard', '/create', '/lssns', '/statistics']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('lssn_access_token')?.value
  const isAuthenticated = Boolean(accessToken)
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.has(pathname)
  const isProtectedRoute = pathname === '/' || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isPublicAuthRoute) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
