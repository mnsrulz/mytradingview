'use client';
import { useOptionExposure } from "@/lib/hooks";
import { Box, Container, LinearProgress, Paper, Slider, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import PlayIcon from '@mui/icons-material/PlayArrow';
import { IconButton } from "@mui/material";
import { ChartTypeSelectorTab, DteStrikeSelector } from "./ChartTypeSelectorTab";
import { DataModeType, DexGexType } from "@/lib/types";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { GreeksExposureChart } from "./GreeksExposureChart";
import { UpdateFrequencyDisclaimer } from "./UpdateFrequencyDisclaimer";

export const OptionsExposureComponent = (props: { symbol: string, cachedDates: string[] }) => {
    const { symbol, cachedDates } = props;
    const [historicalDate, setHistoricalDate] = useState(cachedDates.at(-1) || '');
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(50));
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(30));
    const [exposureTab, setexposureTab] = useQueryState<DexGexType>('tab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));
    const [dataMode, setDataMode] = useQueryState<DataModeType>('mode', parseAsStringEnum<DataModeType>(Object.values(DataModeType)).withDefault(DataModeType.CBOE));
    const { exposureData, isLoaded, hasError } = useOptionExposure(symbol, dte, strikeCounts, exposureTab, dataMode, historicalDate);
    if (!exposureData) return <LinearProgress />;

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
        <DteStrikeSelector dte={dte} strikeCounts={strikeCounts} setDte={setDte} setStrikesCount={setStrikesCount} symbol={symbol} dataMode={dataMode} setDataMode={setDataMode} hasHistoricalData={cachedDates.length > 0} />
        <Paper sx={{ mt: 2 }}>
            <ChartTypeSelectorTab tab={exposureTab} onChange={setexposureTab} />
            <Box sx={{ m: 1 }}>
                {hasError ? <i>Error occurred! Please try again...</i> : <GreeksExposureChart exposureData={exposureData} dte={dte} symbol={symbol} exposureType={exposureTab} isLoaded={isLoaded} />}
            </Box>
        </Paper>
        {dataMode == DataModeType.HISTORICAL && <Paper sx={{ px: 4 }}>
            <HistoricalDateSlider dates={cachedDates} onChange={(v) => setHistoricalDate(v)} currentValue={historicalDate} />
            {/* <Stack direction={'row'} spacing={2} sx={{ alignItems: "center" }}>
            </Stack> */}
            {/* <IconButton onClick={startHistoricalAnimation}><PlayIcon /></IconButton> */}
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

    return <Slider
        key={currentValue}
        value={value}
        onChange={(e, v) => setValue(v as number)}
        onChangeCommitted={(e, v) => onChange(dates[v as number])}
        getAriaValueText={(v, ix) => dates[ix]}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => dayjs(dates[v]).format('D MMM')}
        marks={strikePriceMarks}
        min={0}
        max={dates.length - 1}
        step={1} />
};

