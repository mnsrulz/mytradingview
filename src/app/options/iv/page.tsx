import { getWatchlist } from "@/lib/dataService";
import { Wrapper } from "@/components/IVHistorical/Wrapper";

export default async function Page() {
    const watchList = await getWatchlist();
    const symbols = watchList.map(k=> k.symbol);
    return <Wrapper symbols={symbols} />
}