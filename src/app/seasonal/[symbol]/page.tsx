import { EarningsSeasonComponent, HistoricalSeason, SeasonHeader } from '@/components/HistoricalSeason';
import { getEarningDates, getSeasonalView } from '@/lib/tradierService';
import { EarningsSeason } from '@/lib/types';
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
            const dailyData = await getSeasonalView(symbol, '1y', 'daily');
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

async function getEarningsView(symbol: string) {
    const earnings = await getEarningDates(symbol);
    const { history } = await getSeasonalView(symbol, '5y', 'daily');
    const data = history.day;

    const entries: EarningsSeason[] = [];
    const addData = (ix: number) => {
        const lp = ix > 0 ? data[ix - 1].close : data[ix].open;
        const closePercentage = ((data[ix].close - lp) / lp);
        const openPercentage = ((data[ix].open - lp) / lp);

        const nextOpenPercentage = data.length > ix + 1 ? ((data[ix + 1].open - data[ix].close) / data[ix].close) : undefined;
        const nextClosePercentage = data.length > ix + 1 ? ((data[ix + 1].close - data[ix].close) / data[ix].close) : undefined;
        const nextOpen = data.length > ix + 1 ? data[ix + 1].open : undefined;
        const nextClose = data.length > ix + 1 ? data[ix + 1].close : undefined;

        entries.push({
            open: data[ix].open,
            close: data[ix].close,
            closePercentage,
            openPercentage,
            nextOpenPercentage,
            nextClosePercentage,
            nextOpen,
            nextClose,
            date: data[ix].date
        })
    }
    for (const e of earnings) {
        const ix = data.findIndex(j => j.date == e.begin_date_time);
        if (ix < 0) continue;
        addData(ix);
    }
    return entries.reverse();
}