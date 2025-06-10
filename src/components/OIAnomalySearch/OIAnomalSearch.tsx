'use client';
import { Divider, ListItem, ListItemText, Typography } from '@mui/material';
import { SearchBox, Hits, InstantSearch, Pagination, RangeInput, RefinementList, SortBy } from 'react-instantsearch';
import 'instantsearch.css/themes/satellite.css';
import { Box, Stack, Paper } from '@mui/material'
// import { OptionsGreekReportBySymbolDialog } from './OptionsGreekReportBySymbol';
// import { columnGroupingModel, dteOptions } from './constants';
const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];

import { searchOIAnomaly, searchOIAnomalyFacet } from '@/lib/mzDataService';
import { positiveNegativeNonDecimalFormatter } from '@/lib/formatters';
import CopyToClipboardButton from '../CopyToClipboard';
import { CustomHits } from './CustomHits';

export const searchClient = {
    async search<T>(searchMethodParams: any, requestOptions?: any): Promise<any> {
        // debugger;
        const result = await searchOIAnomaly(searchMethodParams);
        // await delay(1000); // Simulate network delay
        return result;
        // return {
        //     results: [
        //         {
        //             hits: [
        //                 {
        //                     objectID: "1",
        //                     title: "Hit 1",
        //                     expiration: "2023-12-31"
        //                 },
        //                 {
        //                     objectID: "2",
        //                     title: "Hit 2",
        //                     expiration: "2024-01-31"
        //                 }
        //             ],
        //             page: 0,
        //             nbHits: 123,
        //             nbPages: Math.ceil(123 / 20),
        //             hitsPerPage: 20,
        //             processingTimeMS: 100,
        //             facets: {
        //                 expiration: { '2025-01-31': 10, '2024-12-31': 5, '2024-11-30': 3 },
        //                 symbol: { 'AAPL': 20, 'GOOGL': 15 }
        //             },
        //             // exhaustiveFacetsCount: true,
        //             // exhaustiveNbHits: true,
        //             // query: (searchMethodParams && searchMethodParams[0] && searchMethodParams[0].params && searchMethodParams[0].params.query) || "",
        //             // params: (searchMethodParams && searchMethodParams[0] && searchMethodParams[0].params) ? Object.entries(searchMethodParams[0].params).map(([k, v]) => `${k}=${v}`).join('&') : ""
        //         }
        //     ]
        // }
    },
    searchForFacetValues: async function (searchForFacetValuesMethodParams: any, requestOptions?: any): Promise<any> {
        const result = await searchOIAnomalyFacet(searchForFacetValuesMethodParams[0]);
        // await delay(1000); // Simulate network delay
        return result;
    }
};


export const OIAnomalyInstantSearch = ({ mostRecentExposureData }: { mostRecentExposureData: string }) => {
    return <InstantSearch searchClient={searchClient} indexName="INDEX_NAME" initialUiState={{
        "INDEX_NAME": {
            refinementList: {
                "dt": [mostRecentExposureData]
            },
            range: {
                "dte": "7"
            }
        }
    }} >
        <Stack direction="row" spacing={3}>
            <Paper elevation={1} sx={{ minWidth: 220, p: 2 }}>
                <Typography variant='button'>Data Mode</Typography>
                <RefinementList title='Data Mode' attribute="dt" sortBy={['name:desc']} searchable={true} showMore={true} />
                <Divider sx={{ my: 2 }} />
                <Typography variant='button'>Expiration</Typography>
                <RefinementList title='Expiration' attribute="expiration" sortBy={['name:asc']} />
                <Divider sx={{ my: 2 }} />
                <RefinementList title='Symbols' attribute="option_symbol" searchable={true} searchablePlaceholder='Search symbols...' />
                <Divider sx={{ my: 1 }} />
                <Typography variant='button'>Option Type</Typography>
                <RefinementList title='Option Type' attribute="option_type" />

                <Divider sx={{ my: 2 }} />
                <Typography variant='button'>DTE</Typography>
                <RangeInput attribute='dte' min={0} max={999} />

                <Divider sx={{ my: 2 }} />
                <Typography variant='button'>Sort By</Typography>
                {/* <SortBy items={[
                    { label: 'score', value: 'score' },
                    { label: 'score desc', value: 'score_desc' }
                ]} /> */}
            </Paper>
            <Box flex={1}>
                <SearchBox />
                <CustomHits />
                {/* <Box mt={3}>
                    <Pagination />
                </Box> */}
            </Box>
        </Stack>
    </InstantSearch >
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