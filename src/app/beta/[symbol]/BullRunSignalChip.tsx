'use client';
import { Chip, Skeleton, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useBullRunSignal } from '@/lib/bullrun/useBullRunSignal';

export const BullRunSignalChip = ({ symbol }: { symbol: string }) => {
    const { badge, isLoading, error, noData, insufficientHistory } =
        useBullRunSignal(symbol);

    if (isLoading) return <Skeleton variant="rounded" width={92} height={24} />;
    if (error || noData || insufficientHistory || !badge) return null;

    return (
        <Tooltip
            title={`Bull-run entry signal as of ${badge.wk} — open detail`}
            placement="top"
        >
            <Chip
                component={Link}
                href={`/beta/${symbol}/signal`}
                label={`Bull-Run ${badge.rule_pass ? 'ON' : 'OFF'}`}
                color={badge.rule_pass ? 'success' : 'default'}
                variant={badge.rule_pass ? 'filled' : 'outlined'}
                size="small"
                clickable
                sx={{ fontWeight: 700 }}
            />
        </Tooltip>
    );
};
