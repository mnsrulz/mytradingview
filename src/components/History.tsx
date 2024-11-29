'use client';
import { FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, Tab, Tabs } from '@mui/material';
import { HistoricalDex } from '@/components/HistoricalDex';
import { parseAsBoolean, parseAsStringEnum, parseAsStringLiteral, useQueryState } from 'nuqs';

export const HistoryByDate = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [showAllSymbols, setShowAllSymbols] = useQueryState('all', parseAsBoolean.withDefault(false));
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));

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
        {/* <Link href='history/legacy'>Legacy Mode</Link> */}
        <Grid container>
            <HistoricalDex dt={date} showAllSymbols={showAllSymbols} />
        </Grid>
    </>
}