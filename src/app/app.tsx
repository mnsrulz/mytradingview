'use client';
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Box, Container } from "@mui/material";
import { NoPrefetch } from "@/components/NoPrefetch";
import { Footer } from "@/components/Footer";
import { DialogsProvider } from "@toolpad/core";

export function Dashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout slots={{ sidebarFooter: Footer }}>
    <NoPrefetch />
    <NuqsAdapter>
      <Container maxWidth={false} disableGutters sx={{ p: 1, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <DialogsProvider>
          {children}
      <Box
        sx={{
          m: 1,
          height: 2,
          minHeight: 2,
          flexShrink: 0,
          // bgcolor: 'red',
        }}
      />
        </DialogsProvider>
      </Container>
      {/* <PageContainer>
        </PageContainer> */}
    </NuqsAdapter>
  </DashboardLayout>;
}
