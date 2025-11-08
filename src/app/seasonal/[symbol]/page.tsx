import { EarningsSeasonComponent, HistoricalSeason, SeasonHeader } from '@/components/HistoricalSeason';
import { getEarningsView, getSeasonalView } from '@/lib/seasonalService'
import { Box, Divider } from '@mui/material';

export default async function Page(
    props: { params: Promise<{ symbol: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
    const params = await props.params;
    const { symbol } = params;
    const p = await props.searchParams;
    const mode = p['mode'] as string || 'Daily';
    const cleanSymbol = decodeURIComponent(symbol).replace(/\W/g, '');
    const component = await getComponent(mode, cleanSymbol);
    return <Box sx={{ mt: 1 }}>
        <SeasonHeader symbol={cleanSymbol} mode={mode} />
        <Divider />
        {component}
    </Box>
}

async function getComponent(mode: string, symbol: string) {
    switch (mode?.toLowerCase()) {
        case 'daily':
            const dailyData = await getSeasonalView(symbol, '5y', 'daily');
            return <HistoricalSeason data={dailyData} symbol={symbol} mode={mode} />
        case 'monthly':
            const monthlyData = await getSeasonalView(symbol, '5y', 'monthly');
            return <HistoricalSeason data={monthlyData} symbol={symbol} mode={mode} />
        case 'earnings':
            const earningsData = await getEarningsView(symbol);
            return <EarningsSeasonComponent data={earningsData} symbol={symbol} mode={mode} />
    }
    return <div>Invlaid mode!</div>
}

