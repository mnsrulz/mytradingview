import * as React from 'react';
import Box from '@mui/material/Box';
import { getCachedReleaseData } from '@/lib/mzDataService';
import { OptionHistoricalGreeksSummaryByDate } from '@/components/OptionHistoricalGreeksSummaryByDate'

export default async function Page({ params }: { params: { symbol: string } }) {
    const cachedSummaryData = await getCachedReleaseData();
    const cachedDates = cachedSummaryData.map(j => j.name);

    return <Box sx={{ height: 400, width: '100%' }}>
        <OptionHistoricalGreeksSummaryByDate cachedDates={cachedDates} />
    </Box>
}