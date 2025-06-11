'use client';
import { Divider, Drawer, IconButton, ListItem, ListItemText, Typography, useMediaQuery, useTheme } from '@mui/material';
import { SearchBox, Hits, InstantSearch, Pagination, RangeInput, RefinementList, SortBy } from 'react-instantsearch';
import { Box, Stack, Paper } from '@mui/material'
import { positiveNegativeNonDecimalFormatter } from '@/lib/formatters';
import CopyToClipboardButton from '../CopyToClipboard';
import { CustomHits } from './CustomHits';
import { searchClient } from './searchClient';

const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];
import 'instantsearch.css/themes/satellite.css';
// import 'instantsearch.css/themes/algolia.css';
import { OIAnomalyFilterSidebar } from './OIAnomalyFilterSidebar';
import TuneIcon from '@mui/icons-material/Tune';

import { useState } from 'react';

export const OIAnomalyInstantSearch = ({ mostRecentExposureData }: { mostRecentExposureData: string }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sidebarOpen, setSidebarOpen] = useState(false);


    return <>

        <InstantSearch searchClient={searchClient} indexName="anomaly_score" initialUiState={{
            "anomaly_score": {
                hitsPerPage: 20,
                refinementList: {
                    "dt": [mostRecentExposureData]
                },
                range: {
                    "dte": "7:"
                }
            }
        }} >
            {isMobile && <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                <OIAnomalyFilterSidebar />
            </Drawer>}
            <Stack direction="row" spacing={3}>
                {!isMobile && <OIAnomalyFilterSidebar />}
                <Box flex={1}>
                    {isMobile && <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start' }}>
                        <SearchBox style={{ marginBottom: 10 }} />
                        <IconButton onClick={() => setSidebarOpen(true)} sx={{ alignSelf: 'flex-start' }}>
                            <TuneIcon />
                        </IconButton>
                    </Box>}
                    {!isMobile && <SearchBox style={{ marginBottom: 10 }} />}
                    <CustomHits />
                    {/* <Box mt={3}>
                    <Pagination />
                </Box> */}
                </Box>
            </Stack>
        </InstantSearch >
    </>
}


function OIHit({ hit }:
    { hit: { dt: string, option_symbol: string, strike: string, option_type: string, expiration: string, option: string, delta: number, gamma: number } }) {
    const { dt, option_symbol, option_type, strike, expiration, option, delta, gamma } = hit;
    const primarText = `${option_symbol} $${strike} ${option_type} `;
    return <ListItem
        key={`${option}-${dt}`}
        disableGutters>
        <ListItemText
            slotProps={{
                primary: {
                    fontSize: primaryTextSize
                },
                secondary: {
                    fontSize: secondaryTextSize,
                }
            }}
            primary={<>
                {primarText}

                <CopyToClipboardButton text={option}></CopyToClipboardButton>
            </>}
            secondary={<>{expiration}
                {delta ? ` | Δ: ${positiveNegativeNonDecimalFormatter(delta)}` : ''}
                {gamma ? ` | \u03B3: ${positiveNegativeNonDecimalFormatter(gamma)}` : ''}
            </>}
        />
    </ListItem>
    // return <ListItemText
    //     slotProps={{
    //         primary: {
    //             fontSize: primaryTextSize
    //         },
    //         secondary: {
    //             fontSize: secondaryTextSize,
    //         }
    //     }}
    //     primary={<>
    //         {primarText}

    //         <CopyToClipboardButton text={option}></CopyToClipboardButton>
    //     </>}
    //     secondary={<>{expiration}
    //         {delta ? ` | Δ: ${positiveNegativeNonDecimalFormatter(delta)}` : ''}
    //         {gamma ? ` | \u03B3: ${positiveNegativeNonDecimalFormatter(gamma)}` : ''}
    //     </>}
    // />

}