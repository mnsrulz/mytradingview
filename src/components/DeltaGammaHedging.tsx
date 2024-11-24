import { Dialog, DialogContent, DialogActions, Button, LinearProgress, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Box, useMediaQuery, useTheme, DialogTitle } from "@mui/material";
import { useCachedDates, useDeltaGammaHedging } from "@/lib/hooks";
import { useQueryState, parseAsInteger, parseAsStringEnum, parseAsBoolean } from "nuqs";
import { useState } from "react";
import { Expo, typeMap } from "./Expo";

interface ITickerProps {
    symbol: string,
    onClose: () => void,
    skipAnimation?: boolean
}

enum DexGexType {
    'DEX' = 'DEX',
    'GEX' = 'GEX',
    'OI' = 'OI',
    'VOLUME' = 'VOLUME'
}

export const DeltaGammaHedging = (props: ITickerProps) => {
    const { onClose } = props;
    const [printMode] = useQueryState('print', parseAsBoolean.withDefault(false));
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(50));
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(30));
    const { cachedDates } = useCachedDates(props.symbol);
    const [dataMode, setDataMode] = useState('Live');
    const { data, isLoading } = useDeltaGammaHedging(props.symbol, dte, strikeCounts, dataMode);
    const [gexTab, setGexTab] = useQueryState<DexGexType>('dgextab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm')) || printMode;
    const scroll = printMode ? 'body': 'paper';
    // if (isLoading) return <LinearProgress />;
    // if (!data) return <div>No data to show!!!</div>;

    return (
        <Dialog fullWidth={true} fullScreen={fullScreen} open={true} onClose={onClose} aria-labelledby="delta-hedging-dialog" scroll={scroll} >
            {!printMode && <DialogTitle style={{ padding: 8 }}>
                <Box>
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
                                    return <MenuItem key={c.dt} value={c.dt}>{c.dt}</MenuItem>
                                })
                            }
                        </Select>
                    </FormControl>
                </Box>
            </DialogTitle>
            }
            <DialogContent style={{ minHeight: '480px', padding: 0 }} dividers={!printMode}>
                {!printMode && <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                </Box>
                }
                {
                    isLoading ? <LinearProgress /> : data ? <Box style={{ padding: 8 }}><Expo data={data} exposure={typeMap[gexTab]} symbol={props.symbol} dte={dte} skipAnimation={props.skipAnimation} /></Box> : <div>no data...</div>
                }
            </DialogContent>
            {!printMode && (<DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>)}
        </Dialog >
    );
};