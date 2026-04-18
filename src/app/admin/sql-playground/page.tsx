import { SqlPlayground } from "@/components/Admin/SqlPlayground";
import { getWatchlist } from "@/lib/dataService";

export default async function Page() {
    const watchList = await getWatchlist();
    const symbols = watchList.map(k => k.symbol).sort();
    return <SqlPlayground symbols={symbols} />
}