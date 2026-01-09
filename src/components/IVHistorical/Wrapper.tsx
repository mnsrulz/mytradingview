'use client';
import { useOptionHistoricalVolatility } from "@/lib/socket";
import { Box, Checkbox, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Skeleton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { SymbolsSelector } from "./SymbolsSelector";
import { useExpirations } from "./hooks";
import { getDayOfYear } from 'date-fns';
import Alert from '@mui/material/Alert';
import { BasicChart } from "./BasicChart";
import { TVChart } from "./TVChart";

const deltaOptions = [10,
    25,
    30,
    50,
    70,
    90];

export const Wrapper = (props: { symbols: string[] }) => {
    const { symbols } = props;
    const [symbol, setSymbol] = useState(symbols[0]);
    return <IVComponent symbols={symbols} symbol={symbol} onSymbolChange={setSymbol} />
}

const IVComponent = (props: { symbols: string[], symbol: string, onSymbolChange: (value: string) => void }) => {
    const { symbols, symbol, onSymbolChange } = props;
    const [mode, setMode] = useState('delta');
    const [lookbackPeriod, setLookbackPeriod] = useState(180);
    const { expirations, expiration, setExpiration, strike, setStrike } = useExpirations(symbol);
    const [delta, setDelta] = useState(25);
    const [showTVChart, setShowTVChart] = useState(false);


    const availableStrikes = expirations.find(k => k.expiration == expiration)?.strikes || [];
    const { volatility, isLoading, hasError, error } = useOptionHistoricalVolatility(symbol, lookbackPeriod, delta, strike, expiration, mode as 'delta' | 'strike');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return <>
        <Paper sx={{
            mb: 2,
            overflowX: 'auto',          // enable horizontal scroll
            WebkitOverflowScrolling: 'touch', // smooth scroll on iOS
        }}>
            <Stack direction="row" gap={1} p={1} alignItems="center">
                <FormControl sx={{ minWidth: 125 }} size="small">
                    <SymbolsSelector symbols={symbols} symbol={symbol} handleSymbolChange={onSymbolChange} />
                </FormControl>
                <FormControl sx={{ flexShrink: 0 }} size="small">
                    <InputLabel>EXPIRY</InputLabel>
                    <Select id="expiry" value={expiration} label="EXPIRY" onChange={(e) => setExpiration(e.target.value as string)}>
                        {expirations.map((d) => (<MenuItem key={d.expiration} value={d.expiration}>{d.expiration}</MenuItem>))}
                    </Select>
                </FormControl>
                <FormControl sx={{ flexShrink: 0 }} size="small">
                    <Tooltip title={
                        <>
                            <div><b>DELTA</b>: View options based on delta value.</div>
                            <div><b>STRIKE</b>: View options based on fixed strike price.</div>
                            <div><b>ATM</b>: View options relative to the at-the-money strike.</div>
                        </>
                    }>
                        <InputLabel>MODE</InputLabel>
                    </Tooltip>
                    <Select id="mode" value={mode} label="MODE" onChange={(e) => setMode(e.target.value)}>
                        <MenuItem key="delta" value="delta">DELTA</MenuItem>
                        <MenuItem key="strike" value="strike">STRIKE</MenuItem>
                        <MenuItem key="atm" value="atm">ATM</MenuItem>
                    </Select>
                </FormControl>
                {
                    mode == 'delta' && <FormControl size="small" sx={{ flexShrink: 0 }}>
                        <InputLabel>DELTA</InputLabel>
                        <Select id="delta" value={delta} label="DELTA" onChange={(e) => setDelta(e.target.value as number)}>
                            {deltaOptions.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                        </Select>
                    </FormControl>

                }
                {
                    mode == 'strike' && <FormControl sx={{ minWidth: 80 }} size="small" >
                        <InputLabel>STRIKES</InputLabel>
                        <Select id="strike" value={strike} label="STRIKE" onChange={(e) => setStrike(e.target.value as number)}>
                            {availableStrikes.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                        </Select>
                    </FormControl>
                }
                <FormControl size="small" sx={{ flexShrink: 0 }}>
                    <InputLabel>PERIOD</InputLabel>
                    <Select id="lookback" value={lookbackPeriod} label="PERIOD" onChange={(e) => setLookbackPeriod(e.target.value as number)}>
                        <MenuItem key="ytd" value={getDayOfYear(new Date())}>YTD</MenuItem>
                        <MenuItem key="1M" value={30}>1M</MenuItem>
                        <MenuItem key="2M" value={60}>2M</MenuItem>
                        <MenuItem key="3M" value={90}>3M</MenuItem>
                        <MenuItem key="6M" value={180}>6M</MenuItem>
                        <MenuItem key="1Y" value={365}>365D</MenuItem>
                        <MenuItem key="ALL" value={99999}>ALL</MenuItem>
                    </Select>
                </FormControl>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                {/* <Box sx={{ flexGrow: 1 }} /> */}
                <Stack direction="row" gap={isMobile ? 0.5 : 1}>
                    <FormControl size="small">
                        <FormControlLabel control={<Checkbox checked={showTVChart} onChange={(ev) => setShowTVChart(ev.target.checked)} />}
                            label="V2" />
                    </FormControl>
                </Stack>
            </Stack>
        </Paper>
        {
            hasError ? <Alert severity="error">{error}</Alert> : <Paper>
                {
                    isLoading ? <Skeleton variant="rectangular" height={360} /> :
                        <Box sx={{ width: '100%' }}>
                            {showTVChart ? <TVChart volatility={volatility} /> : <BasicChart volatility={volatility} />}
                            <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                                Implied Volatility and option contact pricing for {symbol} {mode == 'delta' ? `${delta}Δ` : mode == 'atm' ? 'at-the-money' : `$${strike} strike`} options expiring on {expiration}
                            </Typography>
                        </Box>
                }
            </Paper>
        }
    </>
}