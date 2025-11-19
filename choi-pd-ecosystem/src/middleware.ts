import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// Dev mode middleware - simple cookie check
function devModeMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for admin routes
  if (pathname.startsWith('/admin')) {
    const devAuth = request.cookies.get('dev-auth')?.value;

    if (!devAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Production mode - use Clerk
const clerkAuth = clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
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
