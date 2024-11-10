'use client';
import { useCachedReleaseData, useMyStockList } from '@/lib/socket';
import { FormControl, FormControlLabel, Grid, InputLabel, LinearProgress, MenuItem, Select, Switch } from '@mui/material';
import { useState } from 'react';
import { HistoricalDex } from '@/components/HistoricalDex';

export default function Page() {    
    const [showAllSymbols, setShowAllSymbols] = useState(false);
    const { cachedSummaryData, isLoadingCachedSummaryData } = useCachedReleaseData();
    const [dataMode, setDataMode] = useState('');
    if (isLoadingCachedSummaryData) return <LinearProgress />;
    const cachedDates = cachedSummaryData.map(j => j.name);

    const dt = dataMode || cachedDates.at(0) || '';
    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel>Data Mode</InputLabel>
                <Select
                    id="data-mode"
                    value={dt}
                    label="Data Mode"
                    onChange={(e) => setDataMode(e.target.value)}
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
            {/* <Link href='history/legacy'>Legacy Mode</Link> */}
            <Grid container>
                <HistoricalDex dt={dt} showAllSymbols={showAllSymbols} />
            </Grid></>
    );
}
