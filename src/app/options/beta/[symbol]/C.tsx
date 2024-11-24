'use client';
import { Expo, typeMap } from "@/components/Expo";
import { StockOptionsView } from "@/components/StockOptionsView";
import { OptionsHedgingData } from "@/lib/hooks";
import { getOptionData, getOptionExpirations } from "@/lib/tradierService";
import { FormControl, InputLabel, Select, MenuItem, Tab, Tabs, Box, Container, Paper, Grid } from "@mui/material";
import dayjs from "dayjs";
import { parseAsInteger, parseAsString, parseAsStringEnum, parseAsStringLiteral, useQueryState } from "nuqs";

enum DexGexType {
    'DEX' = 'DEX',
    'GEX' = 'GEX',
    'OI' = 'OI',
    'VOLUME' = 'VOLUME'
}


export const C = (props: { symbol: string, cachedDates: string[], dte: number, sc: number, dataMode: string, data: OptionsHedgingData }) => {
    const { cachedDates, data, symbol } = props;
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(props.dte));
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(props.sc));
    const [dataMode, setDataMode] = useQueryState('dt', parseAsString.withDefault(props.dataMode));
    const [gexTab, setGexTab] = useQueryState<DexGexType>('dgextab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));

    return <Container maxWidth="lg">
        <Paper>
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
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
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
            </FormControl>

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
            </Tabs> */}
            <Box>
                {/* <Expo data={data} exposure={typeMap[gexTab]} symbol={symbol} dte={dte} skipAnimation={true} /> */}
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Expo data={data} exposure={'dex'} symbol={symbol} dte={dte} skipAnimation={true} />
                    </Grid>
                    <Grid item xs={6}>
                        <Expo data={data} exposure={'gex'} symbol={symbol} dte={dte} skipAnimation={true} />
                    </Grid>
                    <Grid item xs={6}>
                        <Expo data={data} exposure={'oi'} symbol={symbol} dte={dte} skipAnimation={true} />
                    </Grid>
                    <Grid item xs={6}>
                        <Expo data={data} exposure={'volume'} symbol={symbol} dte={dte} skipAnimation={true} />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    </Container>

}