import { getWatchlist } from "@/lib/dataService";
import { Wrapper } from "@/components/IVHistorical/Wrapper";

export default async function Page() {
    const watchList = await getWatchlist();
    const symbols = watchList.map(k=> k.symbol).sort();
    return <Wrapper symbols={symbols} />
}