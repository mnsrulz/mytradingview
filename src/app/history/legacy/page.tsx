'use client';
import { Expo } from '@/components/DeltaGammaHedging';
import { useCachedSummaryData, useDeltaGammaHedging, useMyStockList } from '@/lib/socket';
import { FormControl, Grid, InputLabel, LinearProgress, MenuItem, Select, Skeleton } from '@mui/material';
import { useState } from 'react';

const WrapperExpo = (props: { symbol: string, dataMode: string }) => {
    const { symbol, dataMode } = props;
    const { data, isLoading } = useDeltaGammaHedging(symbol, 30, 30, dataMode);
    return <div>
        {isLoading ? <Skeleton height={400}></Skeleton> : data ? <Expo skipAnimation={true} data={data} exposure={'dex'} symbol={symbol} dte={30} /> : <div>no data...</div>}
    </div>
}


export default function Page() {
    const { mytickers, loading } = useMyStockList();
    const { cachedSummaryData, isLoadingCachedSummaryData } = useCachedSummaryData();
    const [dataMode, setDataMode] = useState('');
    if (isLoadingCachedSummaryData || loading) return <LinearProgress />;
    const cachedDates = [...new Set(cachedSummaryData.map(r => r.dt))];
    const mytickersSymbols = mytickers.map(r => r.symbol)
    const dt = dataMode || cachedDates.at(0) || '';

    const ts = cachedSummaryData.filter(r => r.dt == dt).filter(r => mytickersSymbols.includes(r.symbol));    //make sure to load only those which are part of the watchlist.
    const m = ts.map(r => {
        return <Grid key={r.symbol} xs={12} xl={3} p={1}><WrapperExpo dataMode={dt} symbol={r.symbol} /></Grid>
    });
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
            <Grid container>
                {m}
            </Grid></>
    );
}
