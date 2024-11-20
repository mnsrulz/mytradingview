'use client';
import { useCachedReleaseSymbolData } from '@/lib/hooks';
import { useMediaQuery, useTheme } from '@mui/material';
import { useMyLocalWatchList } from "@/lib/hooks";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

export const HistoricalDex = (props: { dt: string, showAllSymbols: boolean }) => {
    const { wl } = useMyLocalWatchList();
    const mytickersSymbols = wl.map(r => r.symbol);
    const { dt, showAllSymbols } = props;
    const { cachedSummarySymbolsData } = useCachedReleaseSymbolData(dt);
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("sm"));
    const matchesMd = useMediaQuery(theme.breakpoints.down("md"));
    const numberOfItemsToDisplay = matchesXs ? 2 : matchesMd ? 3 : 4;
    const imgWidth = `${(100 / numberOfItemsToDisplay)}%`;
    const ts = cachedSummarySymbolsData.filter(r => showAllSymbols || mytickersSymbols.includes(r.name));    //make sure to load only those which are part of the watchlist.

    return <PhotoProvider>
        {ts.map((item) => (
            <PhotoView key={item.assetUrl} src={item.assetUrl} >
                <img loading='lazy' src={item.assetUrl} width={imgWidth} height="auto" style={{ objectFit: 'cover' }} alt={item.assetUrl} />
            </PhotoView>
        ))}
    </PhotoProvider>
}