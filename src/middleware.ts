import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes - only the admin panel
const isProtectedRoute = createRouteMatcher([
  '/de/desk-3h9w2r(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Protect admin routes
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
