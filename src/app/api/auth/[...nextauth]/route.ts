import NextAuth from 'next-auth'
import { authOptions, NA } from '@/lib/auth';

// const { GET, POST } = NextAuth(authOptions).handlers;
// export { GET, POST }

export const {
    handlers: { GET, POST },
    auth,
} = NA;


// export { handler as GET, handler as POST }
