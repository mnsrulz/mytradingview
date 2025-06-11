'use client';
import { OIAnomalyInstantSearch } from '@/components/OIAnomalySearch/OIAnomalSearch';
import { getAvailableExposureDates } from '@/lib/mzDataService';
import { Container, LinearProgress, NoSsr, Typography } from '@mui/material';
import 'instantsearch.css/themes/satellite.css';
import { useEffect, useState } from 'react';

export default function Page() {
    const [mostRecentExposureData, setmostRecentExposureData] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        getAvailableExposureDates().then(async k => {
            if (k && k.length > 0) {
                setmostRecentExposureData(k.at(-1)?.dt || '');
            }
        }).catch((err) => {
            setError(`Error occurred! Please try again later.`);
            console.log(err);
        });
    }, []);

    if (error) return <Typography variant='body1' color='red'>{error}</Typography >

    if (!mostRecentExposureData) {
        return <LinearProgress />
    }

    return <Container sx={{ mb: 1 }} maxWidth='xl' disableGutters>
        <NoSsr>
            <OIAnomalyInstantSearch mostRecentExposureData={mostRecentExposureData} />
        </NoSsr>
    </Container >
}