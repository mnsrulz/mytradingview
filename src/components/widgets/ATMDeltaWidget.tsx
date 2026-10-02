'use client';
import { Stack, Typography } from '@mui/material';
import { useOptionsStats } from '@/lib/socket';
import { WidgetShell } from './WidgetShell';

interface ATMDeltaWidgetProps {
    symbol: string;
    lookbackDays: number;
}

export const ATMDeltaWidget = ({ symbol, lookbackDays }: ATMDeltaWidgetProps) => {
    const { stats, isLoading, hasError, error } = useOptionsStats(symbol, lookbackDays);

    const atmDelta = stats?.cd?.length > 0 ? Number(stats.cd[stats.cd.length - 1]) : null;

    return (
        <WidgetShell title="ATM DELTA" loading={isLoading} error={hasError ? error : undefined}>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: atmDelta !== null && atmDelta < 0 ? 'error.main' : 'success.main' }}
                >
                    {atmDelta !== null ? atmDelta.toFixed(2) : '—'}
                </Typography>
                {atmDelta !== null && (
                    <Typography variant="caption" color="text.secondary">δ</Typography>
                )}
            </Stack>
        </WidgetShell>
    );
};
