// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(); // Solo export default

export const config = {
  matcher: [
    // Aplica a todas las rutas, excepto Next.js internals y archivos estáticos
    '/((?!_next|static|favicon\\.ico).*)',
    // Siempre corre en API routes
    '/api/(.*)',
  ],
};
