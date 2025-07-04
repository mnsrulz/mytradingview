import "./globals.css";
import { Inter } from "next/font/google";
import { auth } from '@/lib/auth';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import { NAVIGATION } from './nav'
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Metadata } from "next";
import theme from '@/theme';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Dashboard } from "./app";

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <NextAppProvider
              theme={theme}
              navigation={NAVIGATION}
              session={session}
              authentication={AUTHENTICATION}
              branding={{
                logo: <div></div>,
                title: 'mztrading'
              }}
            >
              <Dashboard>{children}</Dashboard>
            </NextAppProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}

