'use client';
import { Stack, Typography } from '@mui/material';
import { useOptionsStats } from '@/lib/socket';
import { WidgetShell } from './WidgetShell';

interface DeltaIVWidgetProps {
    symbol: string;
    lookbackDays: number;
}

export const DeltaIVWidget = ({ symbol, lookbackDays }: DeltaIVWidgetProps) => {
    const { stats, isLoading, hasError, error } = useOptionsStats(symbol, lookbackDays);

    const callDelta = stats?.cd?.length > 0 ? Number(stats.cd[stats.cd.length - 1]) : null;
    const putDelta = stats?.pd?.length > 0 ? Number(stats.pd[stats.pd.length - 1]) : null;

    return (
        <WidgetShell title="25Δ IV" loading={isLoading} error={hasError ? error : undefined}>
            <Stack direction="row" justifyContent="space-between">
                <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                        Call
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {callDelta !== null ? callDelta.toFixed(1) : '—'}
                    </Typography>
                </Stack>
                <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                        Put
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {putDelta !== null ? putDelta.toFixed(1) : '—'}
                    </Typography>
                </Stack>
            </Stack>
        </WidgetShell>
    );
};
