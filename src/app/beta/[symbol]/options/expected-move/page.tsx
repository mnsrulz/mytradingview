import { getWatchlist } from "@/lib/dataService";
import { Wrapper } from "@/components/ExpectedMoveHistorical";
import { SymbolPageLayout } from "../../SymbolPageLayout";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    const watchList = await getWatchlist();
    const symbols = watchList.map(k => k.symbol).sort();

    return (
        <SymbolPageLayout symbol={symbol} feature="options/expected-move" featureLabel="Expected Move">
            <Wrapper symbols={symbols} symbol={symbol} hideSymbolSelector />
        </SymbolPageLayout>
    );
}
