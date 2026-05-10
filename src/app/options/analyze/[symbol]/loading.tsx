'use client';
import { Box, Paper, Skeleton, Stack, Divider, Container } from '@mui/material';

export default function Page() {
    return (
        <Container maxWidth="md" sx={{ p: 0 }}>
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    borderColor: '#e0e0e0'
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ p: 1.5, minHeight: 64 }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Skeleton variant="circular" width={20} height={20} /> {/* Edit Icon placeholder */}
                        <Skeleton variant="text" width={60} height={32} sx={{ fontSize: '1.2rem' }} /> {/* Ticker */}
                    </Stack>

                    <Box sx={{ flexGrow: 1 }} />

                    <Stack direction="row" spacing={1}>
                        <Skeleton variant="rounded" width={80} height={40} /> {/* Mode Select */}
                        <Skeleton variant="rounded" width={80} height={40} /> {/* Expiry Select */}
                        <Skeleton variant="rounded" width={60} height={40} /> {/* Strikes Input */}
                    </Stack>
                </Stack>

                <Divider />

                {/* 2. Tabs Area */}
                <Stack direction="row" justifyContent="space-around" sx={{ py: 1 }}>
                    <Skeleton variant="text" width={60} height={30} />
                    <Skeleton variant="text" width={60} height={30} />
                    <Skeleton variant="text" width={60} height={30} />
                    <Skeleton variant="text" width={60} height={30} />
                </Stack>

                {/* 3. The Chart Content Area */}
                <Box sx={{ p: 4, position: 'relative', minHeight: 500 }}>
                    {/* Chart Title Placeholder */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Skeleton variant="text" width={300} height={40} />
                    </Box>

                    <Box sx={{ display: 'flex', height: 400 }}>
                        {/* Y-Axis (Prices) */}
                        <Stack spacing={1.2} sx={{ pr: 2, pt: 1 }}>
                            {[...Array(12)].map((_, i) => (
                                <Skeleton key={i} variant="text" width={35} height={15} />
                            ))}
                        </Stack>

                        {/* Main Visual: Simulated Bi-directional Bar Chart */}
                        <Box sx={{ flexGrow: 1, position: 'relative', borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
                            {/* Center Axis Line Placeholder */}
                            <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', bgcolor: '#eee' }} />

                            {/* Random Horizontal Bar Skeletons */}
                            <Stack spacing={2} sx={{ mt: 4 }}>
                                <Skeleton variant="rectangular" width="30%" height={12} sx={{ ml: '20%', borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width="45%" height={24} sx={{ ml: '5%', borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width="20%" height={12} sx={{ ml: '50%', borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width="40%" height={20} sx={{ ml: '30%', borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width="15%" height={12} sx={{ ml: '45%', borderRadius: 1 }} />
                            </Stack>
                        </Box>
                    </Box>

                    {/* X-Axis (Labels at bottom) */}
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, ml: 6 }}>
                        {[...Array(9)].map((_, i) => (
                            <Skeleton key={i} variant="text" width={30} />
                        ))}
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
}