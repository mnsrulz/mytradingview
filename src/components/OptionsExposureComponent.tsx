'use client';
import { useOptionExposure } from "@/lib/hooks";
import { Box, Container, Dialog, Grid, IconButton, LinearProgress, Paper, Skeleton, Slider, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { ChartTypeSelectorTab, DteStrikeSelector } from "./ChartTypeSelectorTab";
import { DataModeType, DexGexType } from "@/lib/types";
import { parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { GreeksExposureChart } from "./GreeksExposureChart";
import { UpdateFrequencyDisclaimer } from "./UpdateFrequencyDisclaimer";
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export const OptionsExposureComponent = (props: { symbol: string, cachedDates: string[] }) => {
    const { symbol, cachedDates } = props;
    const [printMode] = useQueryState('print', parseAsBoolean.withDefault(false));
    const [historicalDate, setHistoricalDate] = useQueryState('historical', parseAsString.withDefault(cachedDates.at(-1) || ''));
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(50));
    const [selectedExpirations, setSelectedExpirations] = useState<string[]>([]);
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(30));
    const [exposureTab, setexposureTab] = useQueryState<DexGexType>('dgextab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));
    const [dataMode, setDataMode] = useQueryState<DataModeType>('mode', parseAsStringEnum<DataModeType>(Object.values(DataModeType)).withDefault(DataModeType.CBOE));
    const { exposureData, isLoading, hasError, expirationData } = useOptionExposure(symbol, dte, selectedExpirations, strikeCounts, exposureTab, dataMode, historicalDate);

    const exposureChartContent = <Box sx={{ m: 1 }} minHeight={400}>{
        (isLoading && !exposureData) ? (    //keep it loading only if there's no data to display. Otherwise the mui charts loading indicator is enough
            <LinearProgress />
        ) : hasError ? (
            <i>Error occurred! Please try again...</i>
        ) : (
            exposureData && (
                <GreeksExposureChart
                    skipAnimation={printMode}
                    exposureData={exposureData}
                    dte={dte}
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

    const hasPrevious = cachedDates.indexOf(historicalDate) > 0;
    const hasNext = cachedDates.indexOf(historicalDate) < cachedDates.length - 1;
    const handlePreviousClick = () => {
        const currentIx = cachedDates.indexOf(historicalDate);
        const nextValue = cachedDates.at(currentIx - 1);
        nextValue && setHistoricalDate(nextValue);
    }

    const handleNextClick = () => {
        const currentIx = cachedDates.indexOf(historicalDate);
        const nextValue = cachedDates.at(currentIx + 1);
        nextValue && setHistoricalDate(nextValue);
    }

    return <Container maxWidth="md" sx={{ p: 0 }}>
        <DteStrikeSelector dte={dte} strikeCounts={strikeCounts}
            availableDates={expirationData.map(k => k.expiration)}
            setCustomExpirations={setSelectedExpirations}
            setDte={setDte} setStrikesCount={setStrikesCount} symbol={symbol} dataMode={dataMode} setDataMode={setDataMode} hasHistoricalData={cachedDates.length > 0} />
        <Paper sx={{ mt: 1 }}>
            <ChartTypeSelectorTab tab={exposureTab} onChange={setexposureTab} />
            {exposureChartContent}
        </Paper>
        {dataMode == DataModeType.HISTORICAL && <Paper sx={{}}>
            <Grid container>
                <Grid>
                    <IconButton size="small" disabled={!hasPrevious} onClick={handlePreviousClick}>
                        <SkipPreviousIcon />
                    </IconButton>
                </Grid>
                <Grid size="grow">
                    <HistoricalDateSlider dates={cachedDates} onChange={(v) => setHistoricalDate(v)} currentValue={historicalDate} />
                </Grid>
                <Grid>
                    <IconButton size="small" disabled={!hasNext} onClick={handleNextClick}>
                        <SkipNextIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </Paper>
        }
        <UpdateFrequencyDisclaimer />
    </Container>
}


type IHistoricalDateSliderPorps = { dates: string[], currentValue?: string, onChange: (v: string) => void }
const HistoricalDateSlider = (props: IHistoricalDateSliderPorps) => {
    const { dates, onChange, currentValue } = props;
    const [value, setValue] = useState<number>(dates.indexOf(currentValue || ''));
    const strikePriceMarks = useMemo(() => {
        const marks = dates.map((m, ix) => ({ value: ix, label: dayjs(m).format('D MMM') }));
        const maxMarks = 5;
        if (dates.length <= maxMarks) return marks;
        const result = [];
        const step = (marks.length - 1) / (maxMarks - 1);
        for (let i = 0; i < maxMarks; i++) {
            result.push(marks[Math.round(i * step)]);
        }
        return result;
    }, [dates]);

    useEffect(() => {
        if (currentValue && dates.indexOf(currentValue)) {
            setValue(dates.indexOf(currentValue));
        }
    }, [currentValue]);

    return <Slider
        // key={currentValue}
        value={value}
        onChange={(e, v) => setValue(v as number)}
        onChangeCommitted={(e, v) => onChange(dates[v as number])}
        getAriaValueText={(v, ix) => dates[ix]}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => dayjs(dates[v]).format('D MMM')}
        marks={strikePriceMarks}
        min={0}
        max={dates.length - 1}
        // size="small"
        step={1} />
};

