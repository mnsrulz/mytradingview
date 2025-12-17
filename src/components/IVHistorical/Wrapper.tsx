'use client';
import { useOptionHistoricalVolatility } from "@/lib/socket";
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useState } from "react";
import { SymbolsSelector } from "./SymbolsSelector";
import { useExpirations } from "./hooks";
import { percentageFormatter } from "@/lib/formatters";

const deltaOptions = [10,
    25,
    30,
    50,
    70,
    90];

export const Wrapper = (props: {symbols: string[]})=> {
    const { symbols } = props;
    const [symbol, setSymbol] = useState(symbols[0]);
    return <IVComponent symbols={symbols} symbol={symbol} onSymbolChange={setSymbol}  />
}

const IVComponent = (props: { symbols: string[], symbol: string, onSymbolChange: (value: string) => void }) => {
    const { symbols, symbol, onSymbolChange } = props;
    const [mode, setMode] = useState('delta');
    const { expirations, expiration, setExpiration, strike, setStrike } = useExpirations(symbol);
    const [delta, setDelta] = useState(25);

    const availableStrikes = expirations.find(k => k.expiration == expiration)?.strikes || [];
    const { volatility, isLoading } = useOptionHistoricalVolatility(symbol, 180, delta, strike, expiration, mode as 'delta' | 'strike');
    const xAxisFormatter = (v: string) => dayjs(v).format("MMM D");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return <>
        <Paper sx={{ mb: 2 }}>
            <Stack direction="row" gap={1} p={1} alignItems={"center"}>
                <FormControl sx={{ mr: 1, minWidth: 125 }} size="small">
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
                    <Select id="mode" value={mode} label="MODE" onChange={(e) => setMode(e.target.value)}>
                        <MenuItem key="delta" value="delta">DELTA</MenuItem>
                        <MenuItem key="strike" value="strike">STRIKE</MenuItem>
                    </Select>
                </FormControl>
                {
                    mode == 'delta' ? <FormControl size="small">
                        <InputLabel>DELTA</InputLabel>
                        <Select id="delta" value={delta} label="DELTA" onChange={(e) => setDelta(e.target.value as number)}>
                            {deltaOptions.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                        </Select>
                    </FormControl> : <FormControl size="small">
                        <InputLabel>STRIKES</InputLabel>
                        <Select id="strike" value={strike} label="STRIKE" onChange={(e) => setStrike(e.target.value as number)}>
                            {availableStrikes.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                        </Select>
                    </FormControl>
                }
                <Stack direction="row" gap={isMobile ? 0.5 : 1}>
                </Stack>
            </Stack>
        </Paper>
        {
            isLoading ? <Paper sx={{ p: 2, textAlign: 'center' }}>Loading...</Paper> : <Paper>
                <Box sx={{ width: '100%' }}>
                    <LineChart
                        sx={{
                            width: '100%',
                            minWidth: 600,
                            height: 400
                        }}
                        series={[
                            { data: volatility.cv, label: 'calls', yAxisId: 'leftAxisId', showMark: false },
                            { data: volatility.pv, label: 'puts', yAxisId: 'leftAxisId', showMark: false },
                        ]}
                        xAxis={[{ scaleType: 'point', data: volatility.dt, valueFormatter: xAxisFormatter }]}
                        yAxis={[
                            { id: 'leftAxisId', label: 'IV %', valueFormatter: percentageFormatter }
                        ]}
                    //grid={{ horizontal: true, vertical: true }}
                    />
                    <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                        Historical Volatility for {symbol} {delta}Δ options expiring on {expiration}
                    </Typography>
                </Box>
            </Paper>
        }
    </>
}