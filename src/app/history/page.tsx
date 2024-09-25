'use client';
import { useCachedReleaseData, useCachedReleaseSymbolData, useMyStockList } from '@/lib/socket';
import { Dialog, DialogContent, DialogTitle, FormControl, Grid, ImageList, ImageListItem, InputLabel, LinearProgress, Link, MenuItem, Select, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
const D1 = (props: { dt: string, mytickersSymbols: string[] }) => {
    const { dt, mytickersSymbols } = props;
    const { cachedSummarySymbolsData } = useCachedReleaseSymbolData(dt);
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("sm"));
    const matchesMd = useMediaQuery(theme.breakpoints.down("md"));
    const numberOfItemsToDisplay = matchesXs ? 2 : matchesMd ? 3 : 4;
    const ts = cachedSummarySymbolsData.filter(r => mytickersSymbols.includes(r.name));    //make sure to load only those which are part of the watchlist.

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
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                    loading="lazy"
                    onClick={() => handleImageClick(`https://mztrading-data.deno.dev/images?dt=${dt}&s=${item.name}`)} />
            </ImageListItem>
        ))}
    </ImageList>
        <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen>
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
                <img src={selectedImage} style={{ width: '100%', height: '90vh', objectFit: 'contain' }} />
            </DialogContent>
        </Dialog>
    </>;
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
