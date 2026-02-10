'use client';
import { useOptionsStats } from "@/lib/socket";
import { Box, Checkbox, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Skeleton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { SymbolsSelector } from "./SymbolsSelector";
import { getDayOfYear } from 'date-fns';
import Alert from '@mui/material/Alert';
import { BasicChart } from "./BasicChart";

export const Wrapper = (props: { symbols: string[] }) => {
    const { symbols } = props;
    const [symbol, setSymbol] = useState(symbols[0]);
    return <OptionsStatComponent symbols={symbols} symbol={symbol} onSymbolChange={setSymbol} />
}

const OptionsStatComponent = (props: { symbols: string[], symbol: string, onSymbolChange: (value: string) => void }) => {
    const { symbols, symbol, onSymbolChange } = props;
    const [lookbackPeriod, setLookbackPeriod] = useState(180);
    const [multiplyPriceForCalculateDelta, setMultiplyPriceForCalculateDelta] = useState(false);
    const { stats, isLoading, hasError, error } = useOptionsStats(symbol, lookbackPeriod);
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
                        <FormControlLabel control={<Checkbox checked={multiplyPriceForCalculateDelta} 
                            onChange={(ev) => setMultiplyPriceForCalculateDelta(ev.target.checked)} />}
                            label="Multiply Price for Delta Calculation" />
                    </FormControl>
                </Stack>
            </Stack>

        </Paper>
        {
            hasError ? <Alert severity="error">{error}</Alert> : <Paper>
                {
                    isLoading ? <Skeleton variant="rectangular" height={360} /> :
                        <Box sx={{ width: '100%' }}>
                            <BasicChart stats={stats} multiplyPriceForCalculateDelta={multiplyPriceForCalculateDelta} />
                            <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                                Stats shown for the symbol {symbol} for the past {lookbackPeriod} days.
                            </Typography>
                        </Box>
                }
            </Paper>
        }
    </>
}