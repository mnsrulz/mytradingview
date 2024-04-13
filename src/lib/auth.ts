import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextRequest } from 'next/server';

const userName = process.env.adminUserName || 'admin';
const secretPassword = process.env.adminPassword || 'admin';

export const authOptions = {
    // pages: {
    //     //signIn: '/login'
    // },
    trustHost: true,
    callbacks: {
        authorized({ auth, request }) {
            const isLoggedIn = isAuthenticated(request) || !!auth?.user;
            return isLoggedIn;
        }
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin", defaultValue: 'admin' },
                password: { label: "Password", type: "password" }
            },
            async authorize(creds, req) {
                const { username, password } = creds;
                if (authenticate(username as string, password as string)) {
                    const user = { id: "1", name: "admin", email: "admin@mztrading-netlify.com" }
                    return user;
                }
                return null
            }
        })
    ]
} satisfies NextAuthConfig;

export const NA = NextAuth(authOptions);

const authenticate = (user: string | undefined, pass: string | undefined) => {
    return user == userName && pass == secretPassword
}

function isAuthenticated(req: NextRequest) {
    return req.headers?.get('authorization')?.split(' ')[1] === credentials.base64;
}

const credentials = {
    userName,
    secretPassword,
    base64: Buffer.from(`${userName}:${secretPassword}`).toString('base64')
}