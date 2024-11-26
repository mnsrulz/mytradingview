'use client';
import { Expo } from "@/components/Expo";
import { calculateHedgingV2, getCalculatedStrikes } from "@/lib/dgHedgingHelper";
import { TradierOptionContractData } from "@/lib/types";
import { FormControl, InputLabel, Select, MenuItem, Box, Grid } from "@mui/material";
import dayjs from "dayjs";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";

enum DexGexType {
    'DEX' = 'DEX',
    'GEX' = 'GEX',
    'OI' = 'OI',
    'VOLUME' = 'VOLUME'
}


export const C = (props: { symbol: string, cachedDates: string[], dte: number, sc: number, dataMode: string, data: TradierOptionContractData[], price: number }) => {
    const { cachedDates, data, symbol, price, sc } = props;
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(props.dte));
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(props.sc));
    const [dataMode, setDataMode] = useQueryState('dt', parseAsString.withDefault(props.dataMode));
    const [gexTab, setGexTab] = useQueryState<DexGexType>('dgextab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));

    const filteredData = data.filter(r => dayjs(r.expiration_date) <= dayjs().add(dte, 'day'));
    const allStrikes = getCalculatedStrikes(price, strikeCounts, [...new Set(filteredData.flatMap(j => data.map(s => s.strike)))]);
    const allDates = [...new Set(filteredData.map(j => j.expiration_date))];
    const { exposureData } = calculateHedgingV2(data, allStrikes, allDates, price);

    return <Box>
        {/* <Paper sx={{ p: 0 }}> */}
        <FormControl sx={{ marginTop: 1 }} size="small">
            <InputLabel>DTE</InputLabel>
            <Select
                id="dte"
                value={dte}
                label="DTE"
                onChange={(e) => setDte(e.target.value as number)}
            >
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={90}>90</MenuItem>
                <MenuItem value={180}>180</MenuItem>
                <MenuItem value={400}>400</MenuItem>
                <MenuItem value={1000}>1000</MenuItem>
            </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }} size="small">
            <InputLabel>Strikes</InputLabel>
            <Select
                id="strikes"
                value={strikeCounts}
                label="Strikes"
                onChange={(e) => setStrikesCount(e.target.value as number)}
            >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={80}>80</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={150}>150</MenuItem>
                <MenuItem value={200}>200</MenuItem>
            </Select>
        </FormControl>
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

        {/* <Tabs
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
            <Box>
                <Expo data={exposureData} exposure={typeMap[gexTab]} symbol={props.symbol} dte={dte} skipAnimation={false} />
            </Box> */}
        <Box>
        </Box>
        <Grid container>
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
        </Grid>
        {/* </Paper> */}
    </Box>
}