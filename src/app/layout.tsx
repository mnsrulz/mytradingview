import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TabsRouter from "./routes";
import { Container, CssBaseline } from "@mui/material";
import { auth } from '@/lib/auth';

const inter = Inter({ subsets: ["latin"], display: 'swap', adjustFontFallback: false });

export const metadata: Metadata = {
  title: "My trading view app",
  description: "My trading view app for viewing trade related stuff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isAuthenticated = session == null ? false : true;
  return (
    <html lang="en">
      <body className={inter.className}>
        <CssBaseline />
        <TabsRouter isAuthenticated={isAuthenticated} />
        {/* <Container maxWidth="lg"> */}
        <div style={{
          padding: '8px'
        }}>
          {children}
        </div>
        {/* </Container> */}
      </body>
    </html>
  );
}
