'use client';
import { Box } from '@mui/material';
import { useState } from 'react';
import { TimeframeSelector } from './TimeframeSelector';
import { IV30Widget } from './IV30Widget';
import { ExpectedMoveWidget } from './ExpectedMoveWidget';
import { DeltaIVWidget } from './DeltaIVWidget';
import { ATMDeltaWidget } from './ATMDeltaWidget';
import { IVRankWidget } from './IVRankWidget';
import { BullRunSignalWidget } from './BullRunSignalWidget';

interface WidgetGridProps {
    symbol: string;
    currentPrice?: number;
}

export const WidgetGrid = ({ symbol, currentPrice }: WidgetGridProps) => {
    const [lookbackDays, setLookbackDays] = useState(180);

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <TimeframeSelector value={lookbackDays} onChange={setLookbackDays} />
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 2,
                }}
            >
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
                    <IV30Widget symbol={symbol} lookbackDays={lookbackDays} />
                </Box>
                <Box>
                    <ExpectedMoveWidget symbol={symbol} lookbackDays={lookbackDays} currentPrice={currentPrice} />
                </Box>
                <Box>
                    <DeltaIVWidget symbol={symbol} lookbackDays={lookbackDays} />
                </Box>
                <Box>
                    <ATMDeltaWidget symbol={symbol} lookbackDays={lookbackDays} />
                </Box>
                <Box>
                    <IVRankWidget symbol={symbol} lookbackDays={lookbackDays} />
                </Box>
                <Box>
                    <BullRunSignalWidget symbol={symbol} />
                </Box>
            </Box>
        </Box>
    );
};
