'use client';
import { Expo, typeMap } from "@/components/Expo";
import { TickerSearchDialog } from "@/components/TickerSearchDialog";
import { calculateHedgingV2, getCalculatedStrikes } from "@/lib/dgHedgingHelper";
import { DexGexType, MiniOptionContract } from "@/lib/types";
import { FormControl, InputLabel, Select, MenuItem, Box, Tab, Tabs, Paper, Container, Typography } from "@mui/material";
import dayjs from "dayjs";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo } from "react";
import { UpdateFrequencyDisclaimer } from "./UpdateFrequencyDisclaimer";


const dteOptions = [30,
    50,
    90,
    180,
    400,
    1000];
const stikeOptions = [20,
    30,
    50,
    80,
    100, 150,
    200]

export const OptionsAnalysisComponent = (props: { symbol: string, cachedDates: string[], dte: number, sc: number, dataMode: string, data: MiniOptionContract[], price: number, tab: DexGexType }) => {
    const { cachedDates, data, symbol, price, sc } = props;
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(props.dte));
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(props.sc));
    const [dataMode, setDataMode] = useQueryState('dt', parseAsString.withDefault(props.dataMode));
    const [gexTab, setGexTab] = useQueryState<DexGexType>('tab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(props.tab));

    const filteredData = useMemo(() => {
        const tillDate = dayjs().add(dte, 'day');
        return data.filter(r => dayjs(r.expiration_date) <= tillDate);
    }, [dte]);
    const allStrikes = useMemo(() => getCalculatedStrikes(price, strikeCounts, [...filteredData.reduce((p, c) => p.add(c.strike), new Set<number>())]), [strikeCounts]);
    const allDates = useMemo(() => [...filteredData.reduce((p, c) => p.add(c.expiration_date), new Set<string>())].sort(), [dte]);
    const { exposureData } = useMemo(() => {
        return calculateHedgingV2(data, allStrikes, allDates, price)
    }, [dte, strikeCounts, allStrikes, allDates]);
    //const router = useRouter();
    return <Container maxWidth="md" sx={{ p: 0 }}>
        <Paper sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControl sx={{ m: 1 }} size="small">
                <TickerSearchDialog symbol={symbol} basePath='' />
            </FormControl>
            <Box display="flex">
                <FormControl sx={{ m: 1, justifyItems: 'right' }} size="small">
                    <InputLabel>DTE</InputLabel>
                    <Select id="dte" value={dte} label="DTE" onChange={(e) => setDte(e.target.value as number)}>
                        {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1 }} size="small">
                    <InputLabel>Strikes</InputLabel>
                    <Select id="strikes" value={strikeCounts} label="Strikes" onChange={(e) => setStrikesCount(e.target.value as number)}>
                        {stikeOptions.map((strike) => <MenuItem key={strike} value={strike}>{strike}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
        </Paper>
        <Paper sx={{ mt: 2 }}>
            <Tabs
                value={gexTab}
                onChange={(e, v) => setGexTab(v)}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                aria-label="full width tabs example"
            >
                <Tab label="Dex" value={'DEX'}></Tab>
                <Tab label="Gex" value={'GEX'}></Tab>
                <Tab label="OI" value={'OI'}></Tab>
                <Tab label="Volume" value={'VOLUME'}></Tab>
            </Tabs>
            <Box sx={{ m: 1 }}>
                {/* {JSON.stringify(exposureData)} */}
                <Expo data={exposureData} exposure={typeMap[gexTab]} symbol={props.symbol} dte={dte} skipAnimation={false} />
            </Box>
        </Paper>
        <UpdateFrequencyDisclaimer />
        {/* <Paper sx={{ p: 0 }}> */}

        {/* <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Data Mode</InputLabel>
            <Select
                id="data-mode"
                value={dataMode}
                label="Data Mode"
                onChange={(e) => setDataMode(e.target.value)}
            >
                <MenuItem value="Live">Live</MenuItem>
                {
                    cachedDates.map(c => {
                        return <MenuItem key={c} value={c}>{c}</MenuItem>
                    })
                }
            </Select>
        </FormControl> */}



        {/* <Grid container>
            <Grid item xs={12} md={6} borderBottom={1} >
                <Expo data={exposureData} exposure={'dex'} symbol={symbol} dte={dte} skipAnimation={true} />
            </Grid>
            <Grid item xs={12} md={6} borderBottom={1}>
                <Expo data={exposureData} exposure={'gex'} symbol={symbol} dte={dte} skipAnimation={true} />
            </Grid>
            <Grid item xs={12} md={6} borderBottom={1}>
                <Expo data={exposureData} exposure={'oi'} symbol={symbol} dte={dte} skipAnimation={true} />
            </Grid>
            <Grid item xs={12} md={6} borderBottom={1}>
                <Expo data={exposureData} exposure={'volume'} symbol={symbol} dte={dte} skipAnimation={true} />
            </Grid>
        </Grid> */}
        {/* </Paper> */}
    </Container>
}