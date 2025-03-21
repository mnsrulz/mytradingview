import { getAvailableExposureSnapshotDates } from '@/lib/mzDataService';
import { ClientOnly } from '@/components/ClientOnly';
import { HistoryWrapper } from '@/components/HistoryWrapper';
import { getWatchlist } from '@/lib/dataService';

export default async function Page() {
    const cachedSummaryData = await getAvailableExposureSnapshotDates();
    const watchList = await getWatchlist();
    const cachedDates = cachedSummaryData.map(j => j.dt).sort().reverse();
    return <ClientOnly><HistoryWrapper cachedDates={cachedDates} symbols={watchList.map(j => j.symbol).sort()} /></ClientOnly>;
}
