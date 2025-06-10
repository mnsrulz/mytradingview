'use client';
import { OIAnomalyInstantSearch } from '@/components/OIAnomalySearch/OIAnomalSearch';
import { getAvailableExposureDates } from '@/lib/mzDataService';
import { Container, LinearProgress, NoSsr } from '@mui/material';
import 'instantsearch.css/themes/satellite.css';
import { useEffect, useState } from 'react';

export default function Page() {
    const [mostRecentExposureData, setmostRecentExposureData] = useState('');
    useEffect(() => {
        getAvailableExposureDates().then(async k => {
            if (k && k.length > 0) {
                setmostRecentExposureData(k.at(-1)?.dt || '');
            }
        });

    }, []);
    if (!mostRecentExposureData) {
        return <LinearProgress />
    }

    return <Container sx={{ mb: 1 }} maxWidth='xl' disableGutters>
        <NoSsr>
            <OIAnomalyInstantSearch mostRecentExposureData={mostRecentExposureData} />
        </NoSsr>
    </Container >
}

