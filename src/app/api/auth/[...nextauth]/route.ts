import NextAuth, { NextAuthOptions } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'
import { authenticate } from '@/lib/auth'

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin" },
                password: { label: "Password", type: "password" }
            },
            async authorize(creds, req) {
                if (authenticate(creds?.username, creds?.password)) {
                    const user = { id: "1", name: "admin", email: "admin@mztrading-netlify.com" }
                    return user
                }
                return null
            }
        })
    ]
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
