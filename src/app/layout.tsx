import "./globals.css";
import { Inter } from "next/font/google";
import { auth } from '@/lib/auth';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import { NAVIGATION } from './nav'
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Container, LinearProgress } from "@mui/material";
import { Metadata } from "next";
import { NoPrefetch } from "@/components/NoPrefetch";
import { Suspense } from "react";
import theme from '@/theme';
import { GoogleAnalytics } from '@next/third-parties/google';

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
              <DashboardLayout>
                <NoPrefetch />
                <NuqsAdapter>
                  <Container maxWidth={false} disableGutters sx={{ p: 1 }}>
                    <Suspense fallback={<LinearProgress />}>
                      {children}
                    </Suspense>
                  </Container>
                  {/* <PageContainer>
                  </PageContainer> */}
                </NuqsAdapter>
              </DashboardLayout>
            </NextAppProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
