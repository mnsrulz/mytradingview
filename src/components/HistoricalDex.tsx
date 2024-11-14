'use client';
import { useCachedReleaseSymbolData } from '@/lib/socket';
import { Dialog, DialogContent, DialogTitle, ImageList, ImageListItem, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMyLocalWatchList } from '@/lib/hooks';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

export const HistoricalDex = (props: { dt: string, showAllSymbols: boolean }) => {
    const { wl } = useMyLocalWatchList([]);
    const mytickersSymbols = wl.map(r => r.symbol);
    const { dt, showAllSymbols } = props;
    const { cachedSummarySymbolsData } = useCachedReleaseSymbolData(dt);
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("sm"));
    const matchesMd = useMediaQuery(theme.breakpoints.down("md"));
    const numberOfItemsToDisplay = matchesXs ? 2 : matchesMd ? 3 : 4;
    const imgWidth = `${(100 / numberOfItemsToDisplay)}%`;
    const ts = cachedSummarySymbolsData.filter(r => showAllSymbols || mytickersSymbols.includes(r.name));    //make sure to load only those which are part of the watchlist.

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };


    return <PhotoProvider>
        {/* <PhotoView src="/1.jpg">
      <img src="/1-thumbnail.jpg" alt="" />
    </PhotoView> */}
        {ts.map((item) => (
            <PhotoView key={item.assetUrl} src={item.assetUrl} >
                <img loading='lazy' src={item.assetUrl} width={imgWidth} height="auto" style={{ objectFit: 'cover' }} alt={item.assetUrl} />
            </PhotoView>
        ))}
    </PhotoProvider>

    // return <><ImageList cols={numberOfItemsToDisplay} gap={1}>
    //     {ts.map((item) => (
    //         <ImageListItem key={item.name} sx={{ width: '100%', height: '100px' }}>
    //             <img src={`https://mztrading-data.deno.dev/images?dt=${dt}&s=${item.name}`}
    //                 style={{
    //                     width: '100%', height: 'auto', objectFit: 'cover',
    //                     transition: 'all 0.3s ease-in-out',
    //                     cursor: 'pointer',
    //                     // boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
    //                     // '&:hover': {
    //                     //   boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    //                     //   transform: 'scale(1.05)',
    //                     // }

    //                 }}
    //                 loading="lazy"
    //                 onClick={() => handleImageClick(`https://mztrading-data.deno.dev/images?dt=${dt}&s=${item.name}`)} />
    //         </ImageListItem>
    //     ))}
    // </ImageList>
    //     <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen={matchesXs}>
    //         <DialogTitle>
    //             <IconButton
    //                 aria-label="close"
    //                 onClick={handleCloseDialog}
    //                 sx={{ position: 'absolute', right: 8, top: 8 }}
    //             >
    //                 <CloseIcon />
    //             </IconButton>
    //         </DialogTitle>
    //         <DialogContent>
    //             <img src={selectedImage} style={{ width: '100%', objectFit: 'contain' }} />
    //         </DialogContent>
    //     </Dialog>
    // </>;
}