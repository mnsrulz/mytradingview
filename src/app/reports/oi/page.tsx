import { Wrapper } from "@/components/OIHistorical";
import { getWatchlist } from "@/lib/dataService";

export default async function Page() {
    const watchList = await getWatchlist();
    return <Wrapper symbols={watchList.map(j => j.symbol).sort()} />;
}