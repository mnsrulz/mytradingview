'use client';
import { ReactNode } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { TickerSearchDialog } from '@/components/TickerSearchDialog';
import RefreshCboeData from '@/components/RefreshCboeData';
import { DataModeType } from '@/lib/types';

interface OptionsPricingHeaderProps {
    symbol: string;
    spotPrice: number;
    timestamp?: Date;
    onRefresh: () => void;
    mobileActions?: ReactNode;
    children?: ReactNode;
}

export const OptionsPricingHeader = (props: OptionsPricingHeaderProps) => {
    const { symbol, spotPrice, timestamp, onRefresh, mobileActions, children } = props;
    return <Stack direction="row" spacing={2} alignItems="flex-end" justifyContent="space-between" sx={{ p: 1.5, pb: 1, flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <TickerSearchDialog symbol={symbol} basePath='' />
                <Divider orientation="vertical" flexItem />
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>Spot Price</Typography>
                    <Typography variant="h6" sx={{ lineHeight: 1.2 }}>${spotPrice}</Typography>
                </Box>
            </Stack>
            {children && <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Divider orientation="vertical" flexItem />
                <Box>{children}</Box>
            </Stack>}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="flex-end">
            {mobileActions && <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>{mobileActions}</Box>}
            {timestamp && <RefreshCboeData dataMode={DataModeType.CBOE} timestamp={timestamp} symbol={symbol} onRefresh={onRefresh} />}
        </Stack>
    </Stack>;
}