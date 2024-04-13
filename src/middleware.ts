import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';
import { NA } from "@/lib/auth"

export default NextAuth(authOptions).auth;
//export default NA.auth;

// export default NA.auth(async (req) => {
//     const session = await NA.auth();
//     if(session) {
//         console.log(`user session found!`);
//     }else {
//         console.log(`user seession not found!!!`);
        
//     }
//     console.log(req.nextUrl);
// })

export const config = { 
       matcher: ['/((?!api/auth|_next/static|_next/image|.*\\.png$).*)']    
};

// async function isAuthenticated(req: NextRequest) {
//     const authheader = req.headers?.get('authorization');
//     if (authheader) {
//         const auth = Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
//         const user = auth[0];
//         const pass = auth[1];

//         if (authenticate(user, pass)) {
//             return true;
//         } else {
//             return false;
//         }
//     } else {
//         // const session = await getServerSession();
//         // if (session?.user?.name) {
//         //     return true;
//         // }
//     }
//     return false;
// }
 

// export async function middleware(req: NextRequest, res: any) {
//     //const session = await getServerSession(req as unknown as any, res as unknown as any, authOptions);

//     // if (await isAuthenticated(req)) {
//     //     return NextResponse.next();
//     // } else {
//     //     return new NextResponse(null, {
//     //         headers: {
//     //             'WWW-Authenticate': 'Basic realm="mztrading"'
//     //         },
//     //         status: 401
//     //     })
//     // }
// }