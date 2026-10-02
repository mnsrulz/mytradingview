'use client';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useOptionHistoricalVolatility } from '@/lib/socket';
import { WidgetShell } from './WidgetShell';
import { DeltaSelector } from './DeltaSelector';
import { ExpiryModeSelector } from './ExpiryModeSelector';
import { DteSelector } from './DteSelector';

interface IVRankWidgetProps {
    symbol: string;
    lookbackDays: number;
}

export const IVRankWidget = ({ symbol, lookbackDays }: IVRankWidgetProps) => {
    const [delta, setDelta] = useState(25);
    const [dte, setDte] = useState(30);

    const { volatility, isLoading, hasError, error } = useOptionHistoricalVolatility(
        symbol,
        lookbackDays,
        delta,
        0,
        '',
        'delta',
        dte,
        'rolling'
    );

    const callIV = volatility.cv || [];
    const putIV = volatility.pv || [];

    const optionIV = useMemo(() => {
        return callIV.map((c, i) => (c + (putIV[i] ?? c)) / 2);
    }, [callIV, putIV]);

    const ivRank = useMemo(() => {
        if (optionIV.length < 2) return null;
        const min = Math.min(...optionIV);
        const max = Math.max(...optionIV);
        const current = optionIV[optionIV.length - 1];
        const range = max - min;
        return range > 0 ? ((current - min) / range) * 100 : 50;
    }, [optionIV]);

    const latestCallIV = callIV.length > 0 ? Number(callIV[callIV.length - 1]) : null;
    const latestPutIV = putIV.length > 0 ? Number(putIV[putIV.length - 1]) : null;

    const getColor = (value: number) => {
        if (value >= 70) return 'error.main';
        if (value >= 40) return 'warning.main';
        return 'success.main';
    };

    const getLabel = (value: number) => {
        if (value >= 70) return 'High';
        if (value >= 40) return 'Normal';
        return 'Low';
    };

    return (
        <WidgetShell
            title="IV RANK"
            headerAction={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <DeltaSelector value={delta} onChange={setDelta} compact />
                    {/* <ExpiryModeSelector value={expiryMode} onChange={setExpiryMode} compact /> */}
                    <DteSelector value={dte} onChange={setDte} compact />
                </Stack>
            }
            loading={isLoading}
            error={hasError ? error : undefined}
        >
            <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                    <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                            Call
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {latestCallIV !== null ? `${latestCallIV.toFixed(0)}%` : '—'}
                        </Typography>
                    </Stack>
                    <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                            Put
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {latestPutIV !== null ? `${latestPutIV.toFixed(0)}%` : '—'}
                        </Typography>
                    </Stack>
                    <Stack spacing={0.25} alignItems="flex-end">
                        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                            Rank
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {ivRank !== null ? ivRank.toFixed(0) : '—'}
                        </Typography>
                    </Stack>
                </Stack>

                {ivRank !== null && (
                    <Stack spacing={0.25}>
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress
                                variant="determinate"
                                value={ivRank}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'grey.100',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 3,
                                        backgroundColor: getColor(ivRank),
                                    },
                                }}
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                            {getLabel(ivRank)}
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </WidgetShell>
    );
};
