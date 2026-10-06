import { StockOptionsView } from "@/components/StockOptionsView";
import { SymbolPageLayout } from "../../SymbolPageLayout";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;

    return (
        <SymbolPageLayout symbol={symbol} feature="options/pricing" featureLabel="Option Pricing">
            <StockOptionsView symbol={symbol} hideSymbolSelector />
        </SymbolPageLayout>
    );
}
