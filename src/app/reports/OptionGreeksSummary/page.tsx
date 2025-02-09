import * as React from 'react';
import { Box } from '@mui/material';
import { getCachedReleaseData } from '@/lib/mzDataService';
import { OptionHistoricalGreeksSummaryByDate } from '@/components/OptionHistoricalGreeksSummaryByDate'
import { ClientOnly } from '@/components/ClientOnly';

export default async function Page() {
    const cachedSummaryData = await getCachedReleaseData();
    const cachedDates = cachedSummaryData.map(j => j.name);

    return <Box>
        <ClientOnly><OptionHistoricalGreeksSummaryByDate cachedDates={cachedDates} /></ClientOnly>
    </Box>
}