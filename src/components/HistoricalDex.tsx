'use client';
import { useCachedReleaseSymbolData } from '@/lib/hooks';
import { useMyLocalWatchList } from "@/lib/hooks";
import 'react-photo-view/dist/react-photo-view.css';
import { HistoricalSnapshotView } from './HistoricalSnapshotView';

export const HistoricalDex = (props: { dt: string, showAllSymbols: boolean }) => {
    const { wl } = useMyLocalWatchList();
    const mytickersSymbols = wl.map(r => r.symbol);
    const { dt, showAllSymbols } = props;
    const { cachedSummarySymbolsData } = useCachedReleaseSymbolData(dt);
    const ts = cachedSummarySymbolsData.filter(r => showAllSymbols || mytickersSymbols.includes(r.name));    //make sure to load only those which are part of the watchlist.

    return <HistoricalSnapshotView items={ts.map(({ name, assetUrl }) => ({ key: name, assetUrl }))} />

}