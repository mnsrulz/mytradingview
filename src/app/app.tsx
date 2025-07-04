'use client';
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Container } from "@mui/material";
import { NoPrefetch } from "@/components/NoPrefetch";
import { Footer } from "@/components/Footer";

export function Dashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout slots={{ sidebarFooter: Footer }}>
    <NoPrefetch />
    <NuqsAdapter>
      <Container maxWidth={false} disableGutters sx={{ p: 1 }}>        
          {children}        
      </Container>
      {/* <PageContainer>
        </PageContainer> */}
    </NuqsAdapter>
  </DashboardLayout>;
}
