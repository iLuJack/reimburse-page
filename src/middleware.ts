import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Optional: Configure specific routes that need authentication
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in',
    '/sign-up',
]);

export default clerkMiddleware(async (auth, req) => {
  // const path = new URL(req.url).pathname;

  const userId = await auth().then(({ userId }) => userId);
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  
  return NextResponse.next();
});

// Configure middleware to run on specific routes
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
