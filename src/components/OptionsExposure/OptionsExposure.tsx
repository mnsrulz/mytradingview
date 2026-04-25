'use client';
import { useOptionExposure } from "@/lib/hooks";
import { Box, Container, Dialog, Grid, IconButton, LinearProgress, Paper } from "@mui/material";
import { useState } from "react";
import { ChartTypeSelectorTab } from "./ChartTypeSelectorTab";
import { DataModeType, DexGexType } from "@/lib/types";
import { parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum, createParser, useQueryState } from "nuqs";
import { MemoizedGreeksExposureChart } from "./GreeksExposureChart";
import { UpdateFrequencyDisclaimer } from "./UpdateFrequencyDisclaimer";
import { HistoricalDateSlider } from "./HistoricalDateSlider";
import { DteStrikeSelector } from "./DteStrikeSelector";
import { StrikeValueType } from "./StrikesSelectorDropdown";
import { ExpiryValue } from "./ExpirySelectorDropdown";
const symbolsWithDailyOptions = ["NDX", "RUT", "XSP", "SPX", "QQQ", "SPY", "IWM"]; //will make it configurable later
const defaultStrikeValue = {
    mode: "single",
    value: 30,
} as StrikeValueType;
const defaultExpiryValue = {
    mode: "dte",
    value: 50,
} as ExpiryValue;

const defaultExpiryValueForIndex = {
    mode: "dte",
    value: 7,
} as ExpiryValue;

export const OptionsExposure = (props: { symbol: string, cachedDates: string[] }) => {
    const { symbol, cachedDates } = props;
    const [printMode] = useQueryState('print', parseAsBoolean.withDefault(false));
    const [historicalDate, setHistoricalDate] = useQueryState('historical', parseAsString.withDefault(cachedDates.at(-1) || ''));
    const showZeroAndNextDte = symbolsWithDailyOptions.includes(symbol);
    const [strikeCounts, setStrikesCount] = useQueryState('sc', strikeRangeParser.withDefault(defaultStrikeValue));   //sc means strike counts
    const [expiryValue, setExpiryValue] = useQueryState('expiry', expiryParser.withDefault(symbolsWithDailyOptions.includes(symbol) ? defaultExpiryValueForIndex : defaultExpiryValue));

    const [exposureTab, setexposureTab] = useQueryState<DexGexType>('dgextab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));
    const [dataMode, setDataMode] = useQueryState<DataModeType>('mode', parseAsStringEnum<DataModeType>(Object.values(DataModeType)).withDefault(DataModeType.CBOE));
    const [refreshToken, setRefreshToken] = useState('');
    const { exposureData, isLoading, hasError, expirationData } = useOptionExposure(symbol, expiryValue, strikeCounts, exposureTab, dataMode, historicalDate, refreshToken);
    const timestamp = exposureData?.timestamp;

    const exposureChartContent = <Box sx={{ m: 1 }} minHeight={400}>{
        (isLoading && !exposureData) ? (    //keep it loading only if there's no data to display. Otherwise the mui charts loading indicator is enough
            <LinearProgress />
        ) : hasError ? (
            <i data-testid="EXPOSURE-CHART-ERROR-OCCURRED">Error occurred! Please try again...</i>
        ) : (
            exposureData && (
                <MemoizedGreeksExposureChart
                    expiryValue={expiryValue}
                    skipAnimation={printMode}
                    exposureData={exposureData}
                    symbol={symbol}
                    exposureType={exposureTab}
                    isLoading={isLoading}
                />
            )
        )
    }</Box>
    if (printMode) {
        return <Dialog fullWidth={true} fullScreen={true} open={true} aria-labelledby="delta-hedging-dialog" scroll='body'>
            {exposureChartContent}
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

        <DteStrikeSelector strikeCounts={strikeCounts}
            availableDates={expirationData.map(k => k.expiration)}
            expiryValue={expiryValue}
            setExpiryValue={setExpiryValue}
            timestamp={timestamp}
            onRefresh={() => setRefreshToken(new Date().toISOString())}
            showZeroAndNextDte={showZeroAndNextDte}
            setStrikesCount={setStrikesCount} symbol={symbol} dataMode={dataMode} 
            setDataMode={setDataMode} hasHistoricalData={cachedDates.length > 0} />
        <Paper sx={{ mt: 1 }}>
            <ChartTypeSelectorTab tab={exposureTab} onChange={setexposureTab} />
            {exposureChartContent}
        </Paper>
        {
            dataMode == DataModeType.HISTORICAL && <HistoricalDateSlider dates={cachedDates} onChange={(v) => setHistoricalDate(v)} currentValue={historicalDate} />
        }
        <UpdateFrequencyDisclaimer />
    </Container>
}

const strikeRangeParser = createParser<StrikeValueType>({
    /*
    sc=20  -> single value form, means 20 strikes in total from current price
    sc=20-50x5 -> range form, means all strikes between 20 and 50
    */
    parse(value) {
        if (value.includes('-')) {
            const [rangePart, incrementPart] = value.split('x');
            const [from, to] = rangePart.split('-');
            const incrementEnabled = incrementPart == '' ? false : true;
            const incrementValue = incrementEnabled ? Number(incrementPart) : undefined;
            return {
                mode: "range",
                from,
                to,
                increment: incrementEnabled ? {
                    enabled: true,
                    step: incrementValue,
                } : {
                    enabled: false,
                }
            }
        } else {
            return {
                mode: "single",
                value: value,
            }
        }
    },
    serialize(value) {
        if (!value) return '';
        if (value.mode == 'range') {
            return `${value.from}-${value.to}${value.increment?.enabled ? `x${value.increment.step}` : ''}`;
        } else {
            return `${value.value}`;
        }
    },
    // eq(a, b) {
    //     console.log(`Comparing strike counts: ${JSON.stringify(a)} and ${JSON.stringify(b)}`);
    //     return JSON.stringify(a) === JSON.stringify(b);
    // },
});

const isNumber = (v: string) => v !== "" && !Number.isNaN(Number(v))
const expiryParser = createParser<ExpiryValue>({
    /*
    sc=20  -> single value form, means 20 strikes in total from current price
    sc=20-50x5 -> range form, means all strikes between 20 and 50
    */
    parse(value) {
        if (isNumber(value)) {
            return {
                mode: "dte",
                value: Number(value)
            }
        } else {
            return {
                mode: "exp",
                values: value.split(',').filter(v => v)   //filter out empty string
            }
        }
    },
    serialize(value) {
        if (!value) return '';
        if (value.mode == 'dte') {
            return `${value.value}`;
        } else {
            return `${value.values.join(',')}`;
        }
    },
    // eq(a, b) {
    //     console.log(`Comparing strike counts: ${JSON.stringify(a)} and ${JSON.stringify(b)}`);
    //     return JSON.stringify(a) === JSON.stringify(b);
    // },
});