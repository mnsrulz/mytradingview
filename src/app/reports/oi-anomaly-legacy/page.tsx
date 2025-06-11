import * as React from 'react';
import { NoSsr } from '@mui/material';
import { getAvailableExposureDates } from '@/lib/mzDataService';
import { OIAnomalyReport } from '@/components/OIAnomaly'
import { getWatchlist } from '@/lib/dataService';

export default async function Page() {
    const [cachedSummaryData, watchList] = await Promise.all([getAvailableExposureDates(), getWatchlist()]);
    const cachedDates = cachedSummaryData.map(j => j.dt).sort().reverse();
    const symbols = watchList.map(j => j.symbol).sort();
    return <NoSsr>
        <OIAnomalyReport cachedDates={cachedDates} symbols={symbols} />
    </NoSsr>
}