'use client';
import { Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';

interface WidgetShellProps {
    title: string;
    headerAction?: React.ReactNode;
    loading?: boolean;
    error?: string;
    children: React.ReactNode;
}

export const WidgetShell = ({ title, headerAction, loading, error, children }: WidgetShellProps) => {
    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.08)',
                },
            }}
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            letterSpacing={0.5}
                            textTransform="uppercase"
                        >
                            {title}
                        </Typography>
                        {headerAction}
                    </Stack>
                    {loading ? (
                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                    ) : error ? (
                        <Typography variant="body2" color="error">{error}</Typography>
                    ) : (
                        children
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
