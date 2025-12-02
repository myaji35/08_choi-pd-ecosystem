import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPDRoute = createRouteMatcher(['/pd(.*)']);

// Dev mode middleware - simple cookie check + subdomain routing
function devModeMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Handle subdomain routing for chopd
  if (hostname.startsWith('chopd.')) {
    // Rewrite to /chopd prefix
    if (!pathname.startsWith('/chopd') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = `/chopd${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Allow login pages
  if (pathname === '/admin/login' || pathname === '/pd/login') {
    return NextResponse.next();
  }

  // Check for admin routes
  if (pathname.startsWith('/admin')) {
    const devAuth = request.cookies.get('dev-auth')?.value;

    if (!devAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check for PD routes
  if (pathname.startsWith('/pd')) {
    const devAuth = request.cookies.get('dev-auth')?.value;

    if (!devAuth) {
      return NextResponse.redirect(new URL('/pd/login', request.url));
    }
  }

  return NextResponse.next();
}

// Production mode - use Clerk + subdomain routing
const clerkAuth = clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') || '';

  // Handle subdomain routing for chopd
  if (hostname.startsWith('chopd.')) {
    const { pathname } = req.nextUrl;
    if (!pathname.startsWith('/chopd') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone();
      url.pathname = `/chopd${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (isAdminRoute(req) || isPDRoute(req)) {
    await auth.protect();
  }
});

export default IS_DEV_MODE ? devModeMiddleware : clerkAuth;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
