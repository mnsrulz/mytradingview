import { getCachedReleaseData } from '@/lib/mzDataService';
import { History } from '@/components/History';
import { ClientOnly } from '@/components/ClientOnly';

export default async function Page() {
    const cachedSummaryData = await getCachedReleaseData();
    const cachedDates = cachedSummaryData.map(j => j.name);
    return <ClientOnly><History cachedDates={cachedDates} /></ClientOnly>
}
