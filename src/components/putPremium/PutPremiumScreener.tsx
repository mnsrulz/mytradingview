'use client';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, Button, FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Slider, Stack, TextField, Typography } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useItemTooltip } from '@mui/x-charts';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { ChartsTooltipContainer } from '@mui/x-charts/ChartsTooltip';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotifications } from '@toolpad/core';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { usePutPremiumData } from '@/lib/hooks';
import { currencyFormatter } from '@/lib/formatters';
import { buildPutPremiumPoints, PutPremiumPoint } from '@/lib/optionsPricing/putPremium';
import { PremiumDisplayModeType, PriceModeTypeEnum } from '@/lib/types';

const MAX_SYMBOLS = 20;
const MOVE_MIN_LIMIT = 1;
const MOVE_MAX_LIMIT = 50;
const DEFAULT_MOVE_START = 10;
const DEFAULT_MOVE_END = 35;
const LOCAL_STORAGE_KEY = 'put-premium-symbols';

const SYMBOL_COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#ffc658', '#d45087', '#a05a2c', '#6b8e23', '#00bfff', '#ff6b6b', '#845ec2'];

function PutPremiumTooltipContent({ displayMode }: { displayMode: PremiumDisplayModeType }) {
    const tooltipData = useItemTooltip();
    if (!tooltipData) return null;
    const { label, color, value } = tooltipData as unknown as { label: string, color: string, value: { z?: PutPremiumPoint } };
    const point = value?.z;
    if (!point) return null;
    const displayPct = displayMode === PremiumDisplayModeType.ANNUALIZED ? point.annualizedPremiumPct : point.premiumPct;
    return (
        <Paper sx={{ px: 1.5, py: 1 }}>
            <Stack spacing={0.25}>
                <Typography variant="subtitle2" sx={{ color }}>{label}</Typography>
                <Typography variant="body2">Strike: {currencyFormatter(point.strike)}</Typography>
                <Typography variant="body2">Move: {point.movePct.toFixed(1)}%</Typography>
                <Typography variant="body2">Premium: {displayPct.toFixed(2)}% ({point.dte}d)</Typography>
                <Typography variant="body2">Premium $: {currencyFormatter(point.premium)}</Typography>
            </Stack>
        </Paper>
    );
}

export const PutPremiumScreener = () => {
    const [refreshToken, setRefreshToken] = useState('');

    const [urlSymbols, setUrlSymbols] = useQueryState('symbols', parseAsString.withDefault(''));
    const [moveMin, setMoveMin] = useQueryState('moveMin', parseAsInteger.withDefault(DEFAULT_MOVE_START));
    const [moveMax, setMoveMax] = useQueryState('moveMax', parseAsInteger.withDefault(DEFAULT_MOVE_END));
    const [expiry, setExpiry] = useQueryState('expiry', parseAsString.withDefault(''));
    const [priceMode, setPriceMode] = useQueryState<PriceModeTypeEnum>('pricemode', parseAsStringEnum<PriceModeTypeEnum>(Object.values(PriceModeTypeEnum)).withDefault(PriceModeTypeEnum.BID_PRICE));
    const [premiumDisplayMode, setPremiumDisplayMode] = useQueryState<PremiumDisplayModeType>('premiumdisplay', parseAsStringEnum<PremiumDisplayModeType>(Object.values(PremiumDisplayModeType)).withDefault(PremiumDisplayModeType.TOTAL));
    const [savedSymbols, setSavedSymbols] = useLocalStorage<string[]>(LOCAL_STORAGE_KEY, []);

    const symbols = useMemo(() => {
        const fromUrl = (urlSymbols || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        const source = fromUrl.length > 0 ? fromUrl : savedSymbols;
        return [...new Set(source)].slice(0, MAX_SYMBOLS);
    }, [urlSymbols, savedSymbols]);

    const setSymbolsList = (next: string[]) => {
        const deduped = [...new Set(next.map(s => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_SYMBOLS);
        setSavedSymbols(deduped);
        setUrlSymbols(deduped.join(','));
    };

    const [scannedSymbols, setScannedSymbols] = useState<string[]>(symbols);
    const [symbolInput, setSymbolInput] = useState(symbols.join(', '));

    const handleSymbolInputChange = (value: string) => {
        setSymbolInput(value);
        setSymbolsList(value.split(',').map(s => s.trim()));
    };

    const handleScan = () => {
        setScannedSymbols(symbols);
        setRefreshToken((t) => `${t}#`);
    };

    const handleReset = () => {
        setSavedSymbols([]);
        setUrlSymbols('');
        setScannedSymbols([]);
        setSymbolInput('');
    };

    const { data, isLoading, warnings: dataWarnings, progress } = usePutPremiumData(scannedSymbols, refreshToken);

    const notifications = useNotifications();
    const prevLoading = useRef(true);

    useEffect(() => {
        if (prevLoading.current && !isLoading && dataWarnings.length > 0) {
            const failedSymbols = dataWarnings.map(w => w.split(':')[0]).join(', ');
            notifications.show(`Failed to scan ${dataWarnings.length} symbol${dataWarnings.length > 1 ? 's' : ''}: ${failedSymbols}`, {
                severity: 'error',
                autoHideDuration: 6000,
            });
        }
        prevLoading.current = isLoading;
    }, [isLoading, dataWarnings, notifications]);

    const expiries = useMemo(() => {
        const set = new Set<string>();
        scannedSymbols.forEach(symbol => {
            const pricing = data.get(symbol);
            if (pricing) Object.keys(pricing.options).forEach(d => set.add(d));
        });
        return [...set].sort();
    }, [data, scannedSymbols]);

    const safeMoveMin = Math.min(Math.max(moveMin, MOVE_MIN_LIMIT), MOVE_MAX_LIMIT);
    const safeMoveMax = Math.max(Math.min(moveMax, MOVE_MAX_LIMIT), MOVE_MIN_LIMIT);
    const moveRangeStart = Math.min(safeMoveMin, safeMoveMax);
    const moveRangeEnd = Math.max(safeMoveMin, safeMoveMax);

    const { points, warnings: computeWarnings } = useMemo(() => buildPutPremiumPoints({
        data,
        symbols: scannedSymbols,
        expiry: expiry || null,
        moveRange: { start: moveRangeStart, end: moveRangeEnd },
        priceMode,
    }), [data, scannedSymbols, expiry, moveRangeStart, moveRangeEnd, priceMode]);

    const series = useMemo(() => {
        const bySymbol = new Map<string, PutPremiumPoint[]>();
        points.forEach(p => {
            const arr = bySymbol.get(p.symbol) ?? [];
            arr.push(p);
            bySymbol.set(p.symbol, arr);
        });
        return scannedSymbols
            .map((symbol, ix) => {
                const data = (bySymbol.get(symbol) ?? []).map(p => ({
                    x: p.movePct,
                    y: premiumDisplayMode === PremiumDisplayModeType.ANNUALIZED ? p.annualizedPremiumPct : p.premiumPct,
                    id: `${symbol}-${p.strike}`,
                    z: p,
                }));
                return {
                    id: symbol,
                    label: symbol,
                    color: SYMBOL_COLORS[ix % SYMBOL_COLORS.length],
                    data,
                };
            })
            .filter(s => s.data.length > 0);
    }, [points, scannedSymbols, premiumDisplayMode]);

    const isEmpty = scannedSymbols.length === 0 || expiries.length === 0 || points.length === 0;
    const allWarnings = computeWarnings;

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h5" gutterBottom>Put Premium Screener</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Compare put-selling premium (premium / strike) across up to {MAX_SYMBOLS} symbols for a given expected move below spot.
                    </Typography>
                </Box>

                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleScan(); }} sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        label="Symbols"
                        placeholder="e.g. AAPL, NVDA, TSLA"
                        value={symbolInput}
                        onChange={(e) => handleSymbolInputChange(e.target.value)}
                        helperText={`${symbols.length}/${MAX_SYMBOLS} symbols — comma-separated`}
                        sx={{
                            flex: '1 1 280px',
                            minWidth: 280,
                            '& .MuiOutlinedInput-root': {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            },
                            '& input': {
                                textTransform: 'uppercase',
                                '&::placeholder': {
                                    textTransform: 'none',
                                },
                            },
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="medium"
                        sx={{ height: 40, borderRadius: 0, px: 2.5 }}
                    >
                        Scan
                    </Button>
                    <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<DeleteIcon />}
                        onClick={handleReset}
                        sx={{ height: 40, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                        Reset
                    </Button>
                </Box>

                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Move range below spot</Typography>
                        <Typography variant="body2">-{moveRangeStart}% to -{moveRangeEnd}%</Typography>
                    </Stack>
                    <Slider
                        value={[moveRangeStart, moveRangeEnd]}
                        onChange={(_, v) => {
                            const [s, e] = v as number[];
                            setMoveMin(s);
                            setMoveMax(e);
                        }}
                        min={MOVE_MIN_LIMIT}
                        max={MOVE_MAX_LIMIT}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `-${v}%`}
                    />
                </Box>

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <FormControl variant="standard" size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Expiry</InputLabel>
                        <Select value={expiry} label="Expiry" onChange={(e) => setExpiry(e.target.value)}>
                            <MenuItem value="">Auto (next monthly)</MenuItem>
                            {expiries.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl variant="standard" size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Price Mode</InputLabel>
                        <Select value={priceMode} label="Price Mode" onChange={(e) => setPriceMode(e.target.value as PriceModeTypeEnum)}>
                            <MenuItem value="LAST_PRICE">Last</MenuItem>
                            <MenuItem value="BID_PRICE">Bid</MenuItem>
                            <MenuItem value="ASK_PRICE">Ask</MenuItem>
                            <MenuItem value="AVG_PRICE">Mid</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="standard" size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Premium %</InputLabel>
                        <Select value={premiumDisplayMode} label="Premium %" onChange={(e) => setPremiumDisplayMode(e.target.value as PremiumDisplayModeType)}>
                            <MenuItem value="TOTAL">Total</MenuItem>
                            <MenuItem value="ANNUALIZED">Annualized</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {isLoading && (
                    <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Scanning symbols…</Typography>
                            <Typography variant="caption" color="text.secondary">{progress.completed}/{progress.total}</Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}
                        />
                    </Stack>
                )}

                {!isLoading && isEmpty && (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        {symbols.length === 0
                            ? `Add up to ${MAX_SYMBOLS} symbols to start screening.`
                            : scannedSymbols.length === 0
                                ? 'Click Scan to run the screener for the selected symbols.'
                                : expiries.length === 0
                                    ? 'No option pricing data available for the selected symbols.'
                                    : 'No strikes fall within the selected move range for the current expiry.'}
                    </Typography>
                )}

                {!isLoading && !isEmpty && (
                    <ScatterChart
                        height={500}
                        margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
                        series={series}
                        slots={{
                            tooltip: () => (
                                <ChartsTooltipContainer trigger="item" anchor="pointer">
                                    <PutPremiumTooltipContent displayMode={premiumDisplayMode} />
                                </ChartsTooltipContainer>
                            ),
                        }}
                        slotProps={{ tooltip: { trigger: 'item' } }}
                        xAxis={[{ label: 'Move % below spot', valueFormatter: (v: number) => `-${v}%` }]}
                        yAxis={[{
                            label: premiumDisplayMode === PremiumDisplayModeType.ANNUALIZED ? 'Annualized premium % of strike' : 'Premium % of strike',
                            valueFormatter: (v: number) => `${v.toFixed(1)}%`,
                        }]}
                    />
                )}

                {!isLoading && allWarnings.length > 0 && (
                    <Stack spacing={1}>
                        {allWarnings.map((w, ix) => <Alert key={ix} severity="warning">{w}</Alert>)}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}