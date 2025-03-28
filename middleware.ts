import { NextResponse } from "next/server"

// Add your allowed IP addresses here
const ALLOWED_IPS = [
  "::1",              // localhost IPv6
  "127.0.0.1",       // localhost IPv4
  "::ffff:127.0.0.1", // localhost mapped IPv4
  "192.168.2.100",   // Your IP
  "192.168.2.0/24",  // Your local network range
]

// Public paths that don't require IP check
const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/_next',
  '/favicon.ico'
]

export function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  
  // Skip IP check for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = request.headers.get("x-real-ip") || 
             request.headers.get("x-forwarded-for")?.split(',')[0] ||
             '0.0.0.0'
  
  // Block if IP is not in whitelist
  if (!ALLOWED_IPS.includes(ip)) {
    console.log(`Access denied for IP: ${ip}`)
    return new NextResponse(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
} 