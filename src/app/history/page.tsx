'use client';
import { useCachedReleaseData, useCachedReleaseSymbolData, useMyStockList } from '@/lib/socket';
import { Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, Grid, ImageList, ImageListItem, InputLabel, LinearProgress, Link, MenuItem, Select, Switch, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
const D1 = (props: { dt: string, mytickersSymbols: string[], showAllSymbols: boolean }) => {
    const { dt, mytickersSymbols, showAllSymbols } = props;
    const { cachedSummarySymbolsData } = useCachedReleaseSymbolData(dt);
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("sm"));
    const matchesMd = useMediaQuery(theme.breakpoints.down("md"));
    const numberOfItemsToDisplay = matchesXs ? 2 : matchesMd ? 3 : 4;
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
    return <><ImageList cols={numberOfItemsToDisplay} gap={1}>
        {ts.map((item) => (
            <ImageListItem key={item.name} sx={{ width: '100%', height: '100px' }}>
                <img src={`https://mztrading-data.deno.dev/images?dt=${dt}&s=${item.name}`}
                    style={{
                        width: '100%', height: 'auto', objectFit: 'cover',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        // boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                        // '&:hover': {
                        //   boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                        //   transform: 'scale(1.05)',
                        // }

                    }}
                    loading="lazy"
                    onClick={() => handleImageClick(`https://mztrading-data.deno.dev/images?dt=${dt}&s=${item.name}`)} />
            </ImageListItem>
        ))}
    </ImageList>
        <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen={matchesXs}>
            <DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseDialog}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <img src={selectedImage} style={{ width: '100%', objectFit: 'contain' }} />
            </DialogContent>
        </Dialog>
    </>;
}

export default function Page() {
    const { mytickers, loading } = useMyStockList();
    const [showAllSymbols, setShowAllSymbols] = useState(false);
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
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <FormControlLabel control={<Switch checked={showAllSymbols} title='Show all symbols available for a given date or limit to your watchlist' onChange={(e, v) => setShowAllSymbols(v)} />} label="Show all?" />
            </FormControl>
            {/* <Link href='history/legacy'>Legacy Mode</Link> */}
            <Grid container>
                <D1 dt={dt} mytickersSymbols={mytickersSymbols} showAllSymbols={showAllSymbols} ></D1>
            </Grid></>
    );
}
