'use client';
import { OIAnomalyInstantSearch } from '@/components/OIAnomalySearch/OIAnomalSearch';
import { useExporsureDates } from '@/lib/hooks';
import { Container, LinearProgress, NoSsr, Typography } from '@mui/material';
import 'instantsearch.css/themes/satellite.css';

export default function Page() {
    const { cachedDates, error, isLoading } = useExporsureDates();
    if (error) return <Typography variant='body1' color='red'>{error}</Typography >
    if (isLoading) return <LinearProgress />

    return <Container sx={{ mb: 1 }} maxWidth='xl' disableGutters>
        <NoSsr>
            <OIAnomalyInstantSearch mostRecentExposureData={cachedDates.at(0) || ''} />
        </NoSsr>
    </Container >
}