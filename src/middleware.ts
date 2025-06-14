import { auth } from "@/lib/auth";
import { logger } from '@/lib/logger'

// Separate regex for API and page routes
const secureApiRoutesRegex = /^\/api\/(trades|symbols\/[^/]+\/options\/analyze\/tradier)$/;
const securePageRoutesRegex = /^\/trades$/;

export default auth((req) => {
       logger.info(`${req.method} ${req.nextUrl.pathname}`, {
              path: req.nextUrl.pathname,
              method: req.method,
              referer: req.headers.get('referer'),
              auth: req.auth,
              ip: req.headers.get('X-Forwarded-For') || req.headers.get('x-real-ip'),
              userAgent: req.headers.get('user-agent')
       });
       if (!req.auth) {
              if (secureApiRoutesRegex.test(req.nextUrl.pathname)) {
                     return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                            status: 401,
                            headers: { 'Content-Type': 'application/json' }
                     });
              }
              if (securePageRoutesRegex.test(req.nextUrl.pathname)) {
                     const newUrl = new URL("/api/auth/signin", req.nextUrl.origin)
                     newUrl.searchParams.set('callbackUrl', req.nextUrl.href);
                     return Response.redirect(newUrl);
              }
       }
})

export const config = {
       matcher: ['/((?!api/auth|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)']
       // matcher: ['/api/trades/:path*', '/trades/:path*']
};
