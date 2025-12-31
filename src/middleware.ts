import { auth } from "@/lib/auth";
import { logger } from '@/lib/logger'
import { clerkMiddleware } from '@clerk/nextjs/server'

// Separate regex for API and page routes
const secureApiRoutesRegex = /^\/api\/(trades|symbols\/[^/]+\/options\/analyze\/tradier)$/;
const securePageRoutesRegex = /^\/(trades|admin(\/.*)?)$/;

// export default auth((req) => {
//        if (!req.auth) {
//               if (secureApiRoutesRegex.test(req.nextUrl.pathname)) {
//                      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
//                             status: 401,
//                             headers: { 'Content-Type': 'application/json' }
//                      });
//               }
//               if (securePageRoutesRegex.test(req.nextUrl.pathname)) {
//                      const newUrl = new URL("/api/auth/signin", req.nextUrl.origin)
//                      newUrl.searchParams.set('callbackUrl', req.nextUrl.href);
//                      return Response.redirect(newUrl);
//               }
//        }
// })


export default clerkMiddleware()

export const config = {
       matcher: ['/((?!api/auth|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)']
       // matcher: ['/api/trades/:path*', '/trades/:path*']
};


