'use client';
import * as React from 'react';
import { LinearProgress, NoSsr, Typography } from '@mui/material';
import { GreeksReport } from '@/components/GreeksReport'
import { useExporsureDates } from '@/lib/hooks';

export default function Page() {
    const { cachedDates, error, isLoading } = useExporsureDates();
    if (isLoading) return <LinearProgress />
    if (error) return <Typography variant='body1' color='red'>{error}</Typography >

    return <NoSsr>
        <GreeksReport cachedDates={cachedDates} />
    </NoSsr>
}