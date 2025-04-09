'use client';
import { Box, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from '@mui/material';
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useSnapshotImagesData } from '@/lib/hooks';
import { useMyLocalWatchList } from "@/lib/hooks";
import { HistoricalSnapshotView } from './HistoricalSnapshotView';

const modes = ['DEX', 'GEX'];

export const HistoryByDate = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [showAllSymbols, setShowAllSymbols] = useQueryState('all', parseAsBoolean.withDefault(false));
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [mode, setMode] = useQueryState('mode', parseAsStringLiteral(modes).withDefault(modes.at(0) || ''));

    const { wl } = useMyLocalWatchList();
    const mytickersSymbols = wl.map(r => r.symbol);
    // const { dt, showAllSymbols } = props;
    const { cachedSummarySymbolsData, isLoadingCachedSummaryData } = useSnapshotImagesData(date);
    const ts = cachedSummarySymbolsData.filter(r => showAllSymbols || mytickersSymbols.includes(r.symbol));    //make sure to load only those which are part of the watchlist.

    return <Box>
        <FormControl sx={{ mr: 1, minWidth: 120 }} size="small">
            <InputLabel>Data Mode</InputLabel>
            <Select
                id="data-mode"
                value={date}
                label="Data Mode"
                onChange={(e) => setDate(e.target.value)}
            >
                {
                    cachedDates.map(c => {
                        return <MenuItem key={c} value={c}>{c}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
        <FormControl sx={{ mr: 1 }} size="small">
            <InputLabel>Mode</InputLabel>
            <Select id="mode" value={mode} label="Mode" onChange={(e) => setMode(e.target.value)} size="small">
                <MenuItem key="DEX" value="DEX">DEX</MenuItem>
                <MenuItem key="GEX" value="GEX">GEX</MenuItem>
            </Select>
        </FormControl>
        <FormControl size="small">
            <FormControlLabel title='Show all symbols available for a given date or limit symbols available in your watchlist' control={<Switch checked={showAllSymbols} onChange={(e, v) => setShowAllSymbols(v)} />} label="Show all?" />
        </FormControl>
        <HistoricalSnapshotView isLoading={isLoadingCachedSummaryData} items={ts.map(({ symbol, dex, gex }) => ({ key: symbol, asset: mode == 'GEX' ? gex : dex }))} />
    </Box>
}