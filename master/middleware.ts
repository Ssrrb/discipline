// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isSalesUploadRoute = createRouteMatcher([
  '/api/stores/(.*)/sales' // Matches your sales upload API route
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  // If the request is for the sales upload route,
  // we let it pass through the middleware without default protection.
  // The `auth()` call within the API route handler itself will manage authentication.
  // This is to prevent the middleware from consuming the request body.
  if (isSalesUploadRoute(req)) {
    return NextResponse.next();
  }

  // For all other routes, apply standard Clerk protection.
  auth.protect();
  // auth.protect() typically handles the response (e.g., redirect or error for unauthenticated users).
  // If it doesn't automatically halt further execution or send a response,
  // an explicit return might be needed, but usually, it's self-contained.
  // For now, let's assume auth.protect() handles the response correctly.
});

export const config = {
  matcher: [
    // Aplica a todas las rutas, excepto Next.js internals y archivos estáticos
    '/((?!_next|static|favicon\\.ico).*)',
    // Siempre corre en API routes
    '/api/(.*)',
  ],
};
