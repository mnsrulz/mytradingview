'use client';
import { useOptionHistoricalVolatility } from "@/lib/socket";
import { Box, FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Skeleton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useState } from "react";
import { SymbolsSelector } from "./SymbolsSelector";
import { useExpirations } from "./hooks";
import { percentageNoDecimalFormatter } from "@/lib/formatters";
import { getDayOfYear } from 'date-fns';
import Alert from '@mui/material/Alert';

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

    const availableStrikes = expirations.find(k => k.expiration == expiration)?.strikes || [];
    const { volatility, isLoading, hasError, error } = useOptionHistoricalVolatility(symbol, lookbackPeriod, delta, strike, expiration, mode as 'delta' | 'strike');
    const xAxisFormatter = (v: string) => dayjs(v).format("MMM D");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return <>
        <Paper sx={{ mb: 2 }}>
            <Stack direction="row" gap={1} p={1} alignItems="center">
                <FormControl sx={{ minWidth: 125 }} size="small">
                    <SymbolsSelector symbols={symbols} symbol={symbol} handleSymbolChange={onSymbolChange} />
                </FormControl>
                <FormControl size="small">
                    <InputLabel>EXPIRY</InputLabel>
                    <Select id="expiry" value={expiration} label="EXPIRY" onChange={(e) => setExpiration(e.target.value as string)}>
                        {expirations.map((d) => (<MenuItem key={d.expiration} value={d.expiration}>{d.expiration}</MenuItem>))}
                    </Select>
                </FormControl>
                <FormControl size="small">
                    <InputLabel>MODE</InputLabel>
                    <Tooltip title={
                        <>
                            <div><b>DELTA</b>: View options based on delta value.</div>
                            <div><b>STRIKE</b>: View options based on fixed strike price.</div>
                            <div><b>ATM</b>: View options relative to the at-the-money strike.</div>
                        </>
                        }>
                        <Select id="mode" value={mode} label="MODE" onChange={(e) => setMode(e.target.value)}>
                            <MenuItem key="delta" value="delta">DELTA</MenuItem>
                            <MenuItem key="strike" value="strike">STRIKE</MenuItem>
                            <MenuItem key="atm" value="atm">ATM</MenuItem>
                        </Select>
                    </Tooltip>
                </FormControl>
                {
                    mode == 'delta' && <FormControl size="small">
                        <InputLabel>DELTA</InputLabel>
                        <Select id="delta" value={delta} label="DELTA" onChange={(e) => setDelta(e.target.value as number)}>
                            {deltaOptions.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                        </Select>
                    </FormControl> 
                     
                }
                {
                    mode == 'strike' && <FormControl sx={{ minWidth: 80 }} size="small">
                        <InputLabel>STRIKES</InputLabel>
                        <Select id="strike" value={strike} label="STRIKE" onChange={(e) => setStrike(e.target.value as number)}>
                            {availableStrikes.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                        </Select>
                    </FormControl>
                }
                <FormControl size="small">
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
                <Stack direction="row" gap={isMobile ? 0.5 : 1}>
                </Stack>
            </Stack>
        </Paper>
        {
            isLoading ? <Paper sx={{ p: 2, textAlign: 'center', height: 400 }}><Skeleton variant="rectangular"  height={360} /></Paper> : <Paper>
                {
                    hasError ? <Alert severity="error">{error}</Alert> :
                        <Box sx={{ width: '100%' }}>
                            <LineChart
                                sx={{
                                    width: '100%',
                                    minWidth: 600,
                                    height: 400
                                }}
                                series={[
                                    { data: volatility.cv, label: 'CALL IV', yAxisId: 'leftAxisId', showMark: false, color: 'green' },
                                    { data: volatility.pv, label: 'PUT IV', yAxisId: 'leftAxisId', showMark: false, color: 'red' },
                                    { data: volatility.cp, label: 'CALL Price', yAxisId: 'rightAxisId', showMark: false, color: 'lightgreen' },
                                    { data: volatility.pp, label: 'PUT Price', yAxisId: 'rightAxisId', showMark: false, color: 'pink' },
                                ]}
                                xAxis={[{ scaleType: 'point', data: volatility.dt, valueFormatter: xAxisFormatter }]}
                                yAxis={[
                                    { id: 'leftAxisId', label: 'IV %', valueFormatter: percentageNoDecimalFormatter },
                                    { id: 'rightAxisId', position: 'right', label: 'Contract Price $' }
                                ]}
                            //grid={{ horizontal: true, vertical: true }}
                            />
                            <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                                Implied Volatility and option contact pricing for {symbol} {mode == 'delta' ? `${delta}Δ` : `$${strike} strike`} options expiring on {expiration}
                            </Typography>
                        </Box>
                }
            </Paper>
        }
    </>
}