import * as React from 'react';
import { NoSsr } from '@mui/material';
import { getAvailableExposureDates } from '@/lib/mzDataService';
import { OIAnomalyReport } from '@/components/OIAnomaly'
import { getWatchlist } from '@/lib/dataService';

export default async function Page() {
    const cachedSummaryData = await getAvailableExposureDates();    //let's use this for now
    const cachedDates = cachedSummaryData.map(j => j.dt).sort().reverse();
    const watchList = await getWatchlist();
    const symbols = watchList.map(j => j.symbol).sort();
    return <NoSsr>
        <OIAnomalyReport cachedDates={cachedDates} symbols={symbols} />
    </NoSsr>
}