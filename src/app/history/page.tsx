'use client';
import { Expo } from '@/components/DeltaGammaHedging';
import { useCachedReleaseData, useCachedReleaseSymbolData, useCachedSummaryData, useDeltaGammaHedging, useMyStockList } from '@/lib/socket';
import { FormControl, Grid, ImageList, ImageListItem, InputLabel, LinearProgress, Link, MenuItem, Select, Skeleton } from '@mui/material';
import { useState } from 'react';

const WrapperExpo = (props: { symbol: string, dataMode: string }) => {
    const { symbol, dataMode } = props;    
    return <div>
        {<img src={`https://mztrading-data.deno.dev/images?dt=${dataMode}&s=${symbol}`} loading="lazy" />}
    </div>
}

const D1 = (props: { dt: string, mytickersSymbols: string[] }) => {
    const { dt, mytickersSymbols } = props;
    const { cachedSummarySymbolsData } = useCachedReleaseSymbolData(dt);

    const ts = cachedSummarySymbolsData.filter(r => mytickersSymbols.includes(r.name));    //make sure to load only those which are part of the watchlist.
    return <ImageList cols={3} gap={1}>
        {ts.map((item) => (
            <ImageListItem key={item.name}>
                <WrapperExpo dataMode={dt} symbol={item.name} />
            </ImageListItem>
        ))}
    </ImageList>;
}

export default function Page() {
    const { mytickers, loading } = useMyStockList();
    const { cachedSummaryData, isLoadingCachedSummaryData } = useCachedReleaseData();
    const [dataMode, setDataMode] = useState('');
    if (isLoadingCachedSummaryData || loading) return <LinearProgress />;
    const cachedDates = cachedSummaryData.map(j => j.name);
    const mytickersSymbols = mytickers.map(r => r.symbol)
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
            <Link href='history/legacy'>Legacy Mode</Link>
            <Grid container>
                <D1 dt={dt} mytickersSymbols={mytickersSymbols} ></D1>
            </Grid></>
    );
}
