import { getCachedReleaseData } from '@/lib/mzDataService';
import { History } from '@/components/History';

export default async function Page() {
    const cachedSummaryData = await getCachedReleaseData();
    const cachedDates = cachedSummaryData.map(j => j.name);
    return <History cachedDates={cachedDates} />
}
