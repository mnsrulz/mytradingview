import { HistoricalSeason } from '@/components/HistoricalSeason';
import { TickerSearchNavigation } from '@/components/TickerSearchNavigation';
import { getSeasonalView } from '@/lib/tradierService';

export default async function Page({ params }: { params: { symbol: string } }) {
    const { symbol } = params;
    const dt = await getSeasonalView(symbol, '5y', 'monthly');
    return <>
    {/* not working due to clientside and serverside battle.. let's look at it later */}
        {/* <TickerSearchNavigation basePath='/seasonal' /> */}
        <HistoricalSeason data={dt} />
    </>
}


