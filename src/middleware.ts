import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticate } from '@/lib/auth';

async function isAuthenticated(req: NextRequest) {
    const authheader = req.headers?.get('authorization');
    if (authheader) {
        const auth = Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];

        if (authenticate(user, pass)) {
            return true;
        } else {
            return false;
        }
    } else {
        // const session = await getServerSession();
        // if (session?.user?.name) {
        //     return true;
        // }
    }
    return false;
}


export async function middleware(req: NextRequest) {
    if (await isAuthenticated(req)) {
        return NextResponse.next();
    } else {
        return new NextResponse(null, {
            headers: {
                'WWW-Authenticate': 'Basic realm="mztrading"'
            },
            status: 401
        })
    }
}