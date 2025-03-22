'use client';
import { Grid, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const OverlayRender = (props: { v: string }) => {
    return <div style={{ position: 'absolute', bottom: 0, zIndex: 100, display: 'flex', justifyContent: 'center', width: '100%', color: 'lightgrey' }}>
        {props.v}
    </div>
}

export const HistoricalSnapshotView = (props: { isLoading: boolean, showKeyOnOverlay?: boolean, items: { key: string, asset: { sdAssetUrl: string, hdAssetUrl: string } }[] }) => {
    const { isLoading, items, showKeyOnOverlay } = props;
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("sm"));
    // const matchesMd = useMediaQuery(theme.breakpoints.down("md"));
    const numberOfItemsToDisplay = matchesXs ? 2 : 3;
    const imgWidth = `${(100 / numberOfItemsToDisplay)}%`;
    if (isLoading) return <LinearProgress />
    return <Grid container>
        <PhotoProvider overlayRender={(p) => showKeyOnOverlay && <OverlayRender v={items[p.index].key} />}>
            {items.map((item) => (
                <PhotoView key={item.key} src={item.asset.hdAssetUrl}  >
                    <img key={item.key} loading='lazy' src={item.asset.sdAssetUrl} width={imgWidth} height="auto" style={{ objectFit: 'cover', aspectRatio: '1' }} alt={item.key} />
                </PhotoView>
            ))}
        </PhotoProvider>
    </Grid>
}