import { getWatchlist } from "@/lib/dataService";
import { Wrapper } from "@/components/ExpectedMoveHistorical";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    const watchList = await getWatchlist();
    const symbols = watchList.map(k => k.symbol).sort();

    return (
        <Wrapper symbols={symbols} symbol={symbol} />
    );
}