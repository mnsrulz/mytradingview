'use client';
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Box, Container, Stack } from "@mui/material";
import { NoPrefetch } from "@/components/NoPrefetch";
import { Footer } from "@/components/Footer";
import { DialogsProvider } from "@toolpad/core";


import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignIn
} from '@clerk/nextjs'


const CustomToolbar = () => {
  return <Stack direction="row" alignItems="center">
    <ThemeSwitcher />
    <SignedOut>
      <SignInButton />
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </Stack>
}

export function Dashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout slots={{ sidebarFooter: Footer, toolbarActions: () => <CustomToolbar /> }}>
    <NoPrefetch />
    <NuqsAdapter>
      <Container maxWidth={false} disableGutters sx={{ p: 1 }}>
        <DialogsProvider>
          {children}
        </DialogsProvider>
      </Container>
      {/* <PageContainer>
        </PageContainer> */}
    </NuqsAdapter>
  </DashboardLayout>;
}
