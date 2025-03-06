import * as React from 'react';
import { Box } from '@mui/material';
import { getAvailableExposureDates } from '@/lib/mzDataService';
import { OptionHistoricalGreeksSummaryByDate } from '@/components/OptionHistoricalGreeksSummaryByDate'
import { ClientOnly } from '@/components/ClientOnly';

export default async function Page() {
    const cachedSummaryData = await getAvailableExposureDates();
    const cachedDates = cachedSummaryData.map(j => j.dt).sort().reverse();

    return <Box>
        <OptionHistoricalGreeksSummaryByDate cachedDates={cachedDates} />
    </Box>
}