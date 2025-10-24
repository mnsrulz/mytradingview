'use client';
import { Box, Grid, LinearProgress, Skeleton, Typography } from '@mui/material';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useState } from 'react';

const OverlayRender = (props: { v: string }) => {
    return <div style={{ position: 'absolute', bottom: 0, zIndex: 100, display: 'flex', justifyContent: 'center', width: '100%', color: 'lightgrey' }}>
        {props.v}
    </div>
}

const skeletonBase64 =
    "data:image/svg+xml;base64," +
    btoa(`
<svg width="620" height="620" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e0e0e0" offset="20%" />
      <stop stop-color="#f0f0f0" offset="50%" />
      <stop stop-color="#e0e0e0" offset="80%" />
    </linearGradient>
  </defs>
  <rect width="620" height="620" fill="#e0e0e0" />
  <rect width="620" height="620" fill="url(#g)">
    <animate attributeName="x" from="-620" to="620" dur="1.5s" repeatCount="indefinite" />
  </rect>
</svg>
`);

export default function SkeletonImage() {
    return (
        <img
            src={skeletonBase64}
            width="100%"
            height="auto"
            alt="skeleton placeholder"
            style={{ aspectRatio: '1' }}
        />
    );
}

const ImageWithLoader = (props: { src: string, alt: string, assetKey: string }) => {
    const { src, alt, assetKey } = props;
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
            {/* Loader (shown until image is loaded) */}
            {/* {!isLoaded && <Skeleton variant="rectangular" width={480} height={480} />} */}
            {!isLoaded && <SkeletonImage />}
            {/* Actual image */}
            <img
                key={assetKey}
                src={src}
                alt={alt}
                width="100%"
                height="auto"
                loading='lazy'
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsLoaded(true)} // hide loader even if failed
                style={{
                    objectFit: 'cover', aspectRatio: '1', position: "absolute", // position on top of skeleton
                    top: 0,
                    left: 0,
                    opacity: isLoaded ? 1 : 0, // hide until loaded
                    transition: "opacity 0.4s ease-in-out",
                }}
            />
        </div>
    );
};

export const HistoricalSnapshotView = (props: { isLoading: boolean, showKeyOnOverlay?: boolean, items: { key: string, asset: { sdAssetUrl: string, hdAssetUrl: string } }[] }) => {
    const { isLoading, items, showKeyOnOverlay } = props;
    if (isLoading) return <LinearProgress />
    return <Grid container spacing={1}>
        <PhotoProvider overlayRender={(p) => showKeyOnOverlay && <OverlayRender v={items[p.index].key} />}>
            {items.map((item) => (
                <PhotoView key={item.asset.hdAssetUrl} src={item.asset.hdAssetUrl}>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Box
                            borderRadius={2}
                            overflow="hidden"
                            boxShadow={1} // optional subtle shadow
                            textAlign="center"
                        >
                            <ImageWithLoader
                                assetKey={item.asset.hdAssetUrl}
                                src={item.asset.sdAssetUrl}
                                alt={item.key}
                            />
                            <Typography variant="body2" sx={{ mt: 0.5, mb: 0.5 }}>
                                {item.key}
                            </Typography>
                        </Box>
                    </Grid>
                </PhotoView>
            ))}
        </PhotoProvider>
    </Grid>
}