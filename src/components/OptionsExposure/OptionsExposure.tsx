'use client';
import { useOptionExposure } from '@/hooks/useOptionExposure';
import { Box, Container, Dialog, Grid, IconButton, LinearProgress, Paper } from "@mui/material";
import { memo, useState } from "react";
import { ChartTypeSelectorTab } from "./ChartTypeSelectorTab";
import { DataModeType, DexGexType } from "@/lib/types";
import { parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { GreeksExposureChart } from "./GreeksExposureChart";
import { UpdateFrequencyDisclaimer } from "./UpdateFrequencyDisclaimer";
import { HistoricalDateSlider } from "./HistoricalDateSlider";
import { DteStrikeSelector } from "./DteStrikeSelector";
import { GreeksExposureChartNivo } from './GreeksExposureChartNivo';

export const OptionsExposure = (props: { symbol: string, cachedDates: string[] }) => {
    const { symbol, cachedDates } = props;
    const [printMode] = useQueryState('print', parseAsBoolean.withDefault(false));
    const [historicalDate, setHistoricalDate] = useQueryState('historical', parseAsString.withDefault(cachedDates.at(-1) || ''));
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(50));
    const [selectedExpirations, setSelectedExpirations] = useState<string[]>([]);
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(30));
    const [exposureTab, setexposureTab] = useQueryState<DexGexType>('dgextab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));
    const [dataMode, setDataMode] = useQueryState<DataModeType>('mode', parseAsStringEnum<DataModeType>(Object.values(DataModeType)).withDefault(DataModeType.CBOE));
    const { exposureData, isLoading, hasError, expirationData, hasData } = useOptionExposure(symbol, dte, selectedExpirations, strikeCounts, exposureTab, dataMode, historicalDate);

    if (printMode) {
        return <Dialog fullWidth={true} fullScreen={true} open={true} aria-labelledby="delta-hedging-dialog" scroll='body'>
            <GreeksExposureChartNivo exposureData={exposureData} hasData={hasData} hasError={hasError} isLoading={isLoading} symbol={symbol} skipAnimation={true} />
        </Dialog>
    }

    const startHistoricalAnimation = async () => {
        const delayMs = 1000;
        for (const d of cachedDates) {
            setTimeout(() => {
                setHistoricalDate(d);
            }, delayMs);
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }

    return <Container maxWidth="md" sx={{ p: 0 }}>
        <DteStrikeSelector dte={dte} strikeCounts={strikeCounts}
            availableDates={expirationData.map(k => k.expiration)}
            setCustomExpirations={setSelectedExpirations}
            setDte={setDte} setStrikesCount={setStrikesCount} symbol={symbol} dataMode={dataMode} setDataMode={setDataMode} hasHistoricalData={cachedDates.length > 0} />
        <Paper sx={{ mt: 1 }}>
            <ChartTypeSelectorTab tab={exposureTab} onChange={setexposureTab} />
            <GreeksExposureChartNivo exposureData={exposureData} hasData={hasData} hasError={hasError} isLoading={isLoading} symbol={symbol} />
        </Paper>
        {
            dataMode == DataModeType.HISTORICAL && <HistoricalDateSlider dates={cachedDates} onChange={(v) => setHistoricalDate(v)} currentValue={historicalDate} />
        }
        <UpdateFrequencyDisclaimer />
    </Container>
}

