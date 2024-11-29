'use client';
import { useMediaQuery, useTheme } from '@mui/material';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

export const HistoricalSnapshotView = (props: { items: { key: string, assetUrl: string }[] }) => {
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("sm"));
    // const matchesMd = useMediaQuery(theme.breakpoints.down("md"));
    const numberOfItemsToDisplay = matchesXs ? 2 : 3;
    const imgWidth = `${(100 / numberOfItemsToDisplay)}%`;
    return <PhotoProvider>
        {props.items.map((item) => (
            <PhotoView key={item.key} src={item.assetUrl} >
                <img key={item.key} loading='lazy' src={item.assetUrl} width={imgWidth} height="auto" style={{ objectFit: 'cover' }} alt={item.assetUrl} />
            </PhotoView>
        ))}
    </PhotoProvider>
}