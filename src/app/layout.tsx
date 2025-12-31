import "./globals.css";
import { Inter } from "next/font/google";
//import { auth } from '@/lib/auth';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import { ADMIN_NAVIGATION, NAVIGATION } from './nav'
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Metadata } from "next";
import theme from '@/theme';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Dashboard } from "./app";
import { PageTracker } from "@/components/PageTracker";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignIn
} from '@clerk/nextjs'

import { auth, currentUser } from '@clerk/nextjs/server'
import { SignInPage } from "@toolpad/core";

const inter = Inter({ subsets: ["latin"], display: 'swap', adjustFontFallback: false });
const gaId = process.env.GOOGLE_ANALYTICS_ID || '';

export const metadata: Metadata = {
  title: "My trading view app",
  description: "An advanced platform for in-depth options data analysis.",
};
const AUTHENTICATION = {
  signIn,
  signOut,
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const u = await currentUser();
  const userSession = u && {
    expires: "",
    user: {
      email: u.primaryEmailAddress?.emailAddress || '',
      id: u.username || '',
      name: u.fullName || '',
      image: u.imageUrl || ''
    }
  } || null;

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <NextAppProvider
              theme={theme}
              navigation={userSession?.user?.name === 'admin' ? ADMIN_NAVIGATION : NAVIGATION}
              session={userSession}
              branding={{
                logo: <div></div>,
                title: 'mztrading'
              }}
            >
              <Dashboard>{children}</Dashboard>
            </NextAppProvider>
          </AppRouterCacheProvider>
        </ClerkProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <PageTracker />
    </html>
  );
}

