import { getCachedReleaseData } from '@/lib/mzDataService';
import { ClientOnly } from '@/components/ClientOnly';
import { HistoryWrapper } from '@/components/HistoryWrapper';
import { getWatchlist } from '@/lib/dataService';

export default async function Page() {
    const cachedSummaryData = await getCachedReleaseData();
    const watchList = await getWatchlist();
    const cachedDates = cachedSummaryData.map(j => j.name);
    return <ClientOnly><HistoryWrapper cachedDates={cachedDates} symbols={watchList.map(j=> j.symbol).sort()} /></ClientOnly>;
}
