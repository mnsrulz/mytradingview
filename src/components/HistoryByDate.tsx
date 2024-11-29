'use client';
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from '@mui/material';
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useCachedReleaseSymbolData } from '@/lib/hooks';
import { useMyLocalWatchList } from "@/lib/hooks";
import { HistoricalSnapshotView } from './HistoricalSnapshotView';

export const HistoryByDate = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [showAllSymbols, setShowAllSymbols] = useQueryState('all', parseAsBoolean.withDefault(false));
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));

    const { wl } = useMyLocalWatchList();
    const mytickersSymbols = wl.map(r => r.symbol);
    // const { dt, showAllSymbols } = props;
    const { cachedSummarySymbolsData, isLoadingCachedSummaryData } = useCachedReleaseSymbolData(date);
    const ts = cachedSummarySymbolsData.filter(r => showAllSymbols || mytickersSymbols.includes(r.name));    //make sure to load only those which are part of the watchlist.

    return <>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
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
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <FormControlLabel title='Show all symbols available for a given date or limit symbols available in your watchlist' control={<Switch checked={showAllSymbols} onChange={(e, v) => setShowAllSymbols(v)} />} label="Show all?" />
        </FormControl>
        <HistoricalSnapshotView isLoading={isLoadingCachedSummaryData} items={ts.map(({ name, assetUrl }) => ({ key: name, assetUrl }))} />
    </>
}