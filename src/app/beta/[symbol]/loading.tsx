'use client';
import { Box, Grid, Skeleton, Paper, Stack } from "@mui/material";

export default function Loading() {
    return (
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" gap={2}>
                <Skeleton variant="text" width={120} height={48} />
                <Skeleton variant="text" width={200} height={32} />
            </Stack>
            <Skeleton variant="rectangular" height={2} />
            <Skeleton variant="text" width={150} height={32} />
            <Grid container spacing={2}>
                {[...Array(5)].map((_, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={1}>
                                <Skeleton variant="text" width="70%" height={24} />
                                <Skeleton variant="text" width="90%" height={16} />
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );
}
