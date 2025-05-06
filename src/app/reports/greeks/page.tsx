import * as React from 'react';
import { NoSsr } from '@mui/material';
import { getAvailableExposureDates } from '@/lib/mzDataService';
import { GreeksReport } from '@/components/GreeksReport'

export default async function Page() {
    const cachedSummaryData = await getAvailableExposureDates();
    const cachedDates = cachedSummaryData.map(j => j.dt).sort().reverse();

    return <NoSsr>
        <GreeksReport cachedDates={cachedDates} />
    </NoSsr>
}