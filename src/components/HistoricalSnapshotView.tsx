'use client';
import { Grid, ImageList, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { forwardRef } from 'react';
const Image = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
    ({ src, ...props }, ref) => {
        return <img ref={ref} src={src} className="mr-2 mb-2 w-24 h-24 cursor-pointer object-cover" alt="" {...props} />;
    },
);

export const HistoricalSnapshotView = (props: { isLoading: boolean, items: { key: string, assetUrl: string }[] }) => {
    const { isLoading, items } = props;
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("sm"));
    // const matchesMd = useMediaQuery(theme.breakpoints.down("md"));
    const numberOfItemsToDisplay = matchesXs ? 2 : 3;
    const imgWidth = `${(100 / numberOfItemsToDisplay)}%`;
    if (isLoading) return <LinearProgress />
    return <Grid container>
        <PhotoProvider>
            {items.map((item) => (
                <PhotoView key={item.key} src={item.assetUrl} >
                    <Image key={item.key} loading='lazy' src={item.assetUrl} width={imgWidth} height="auto" style={{ objectFit: 'cover' }} alt={item.assetUrl} />
                    {/* <img key={item.key} loading='lazy' src={item.assetUrl} width={imgWidth} height="auto" style={{ objectFit: 'cover' }} alt={item.assetUrl} /> */}
                </PhotoView>
            ))}
        </PhotoProvider>
    </Grid>
}