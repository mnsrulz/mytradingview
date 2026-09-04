'use client';
import { Chip, Stack, Typography } from "@mui/material";
import { useModifierKey } from "@/lib/useModifierKey";

export default function BetaLayout({ children }: { children: React.ReactNode }) {
    const { modifierLabel } = useModifierKey();

    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="bold">
                    Beta
                </Typography>
                <Chip label={`/ or ${modifierLabel} to search`} size="small" variant="outlined" color="primary" sx={{ opacity: 0.7 }} />
            </Stack>
            {children}
        </Stack>
    );
}
