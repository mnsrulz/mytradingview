'use client';
import { Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import { RangeInput, RefinementList, SortBy } from 'react-instantsearch';
import { Paper } from '@mui/material'
import { useState } from 'react';

export const OIAnomalyFilterSidebar = () => {    
    return <Paper elevation={1} sx={{ minWidth: 220, p: 2 }}>
        <Typography variant='button'>Data Mode</Typography>
        <RefinementList title='Data Mode' attribute="dt" sortBy={['name:desc']} searchable={true} showMore={true} />
        <Divider sx={{ my: 2 }} />
        <Typography variant='button'>Expiration</Typography>
        <RefinementList title='Expiration' attribute="expiration" sortBy={['name:asc']} searchable={true} showMore={true} />
        <Divider sx={{ my: 2 }} />
        <RefinementList title='Symbols' attribute="option_symbol" searchable={true} searchablePlaceholder='Search symbols...' showMore={true} />
        <Divider sx={{ my: 1 }} />
        <Typography variant='button'>Option Type</Typography>
        <RefinementList title='Option Type' attribute="option_type" />

        <Divider sx={{ my: 2 }} />
        <Typography variant='button'>DTE</Typography>
        <RangeInput attribute='dte' min={0} max={9999} />

        <Divider sx={{ my: 2 }} />
        <Typography variant='button'>Sort By</Typography>
        <SortBy items={[
            { label: 'Score', value: 'anomaly_score' },
            { label: 'OI Change', value: 'oi_change' },
            { label: 'Volume', value: 'volume' }
        ]} />
    </Paper>
}