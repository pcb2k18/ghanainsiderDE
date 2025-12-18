import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/de/desk-3h9w2r(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;

  // 👇 explicitly allow root and public content
  if (pathname === '/' || pathname.startsWith('/de')) {
    return;
  }

  // 👇 protect admin routes only
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});
