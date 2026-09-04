import { getWatchlist } from "@/lib/dataService";
import { Wrapper } from "@/components/IVHistorical/Wrapper";
import { SymbolPageLayout } from "../../SymbolPageLayout";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    const watchList = await getWatchlist();
    const symbols = watchList.map(k => k.symbol).sort();

    return (
        <SymbolPageLayout symbol={symbol} feature="options/iv" featureLabel="Implied Volatility">
            <Wrapper symbols={symbols} symbol={symbol} hideSymbolSelector />
        </SymbolPageLayout>
    );
}
