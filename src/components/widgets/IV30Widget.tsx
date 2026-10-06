'use client';
import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useOptionHistoricalVolatility } from '@/lib/socket';
import { WidgetShell } from './WidgetShell';
import { DeltaSelector } from './DeltaSelector';
import { DteSelector } from './DteSelector';
import { SparkLineChart } from '@mui/x-charts';

interface IV30WidgetProps {
    symbol: string;
    lookbackDays: number;
}

export const IV30Widget = ({ symbol, lookbackDays }: IV30WidgetProps) => {
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

    const iv30Data = volatility.cv.map((v, ix) => Number((Number(v) + Number(volatility.pv?.[ix] ?? 0) / 2).toFixed(2))) || [];
    const currentValue = iv30Data.length > 0 ? Number(iv30Data[iv30Data.length - 1]) : null;

    return (
        <WidgetShell
            title={`IV${dte}`}
            headerAction={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <DeltaSelector value={delta} onChange={setDelta} compact />
                    <DteSelector value={dte} onChange={setDte} compact />
                </Stack>
            }
            loading={isLoading}
            error={hasError ? error : undefined}
        >
            <Stack spacing={0.5}>
                {/* {iv30Data.length > 0 && <Sparkline data={iv30Data} color="#1976d2" height={40} />} */}
                {iv30Data.length > 0 && <SparkLineChart showTooltip data={iv30Data} height={100} slotProps={{
                    tooltip: {
                        
                    }
                }} />}
                {/* {currentValue !== null && (
                    <Stack direction="row" alignItems="baseline" spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {currentValue.toFixed(1)}%
                        </Typography>
                    </Stack>
                )} */}
            </Stack>
        </WidgetShell>
    );
};
