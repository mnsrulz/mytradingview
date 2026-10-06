import { SymbolPageLayout } from "../SymbolPageLayout";
import { BullRunSignalView } from "./BullRunSignalView";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    return (
        <SymbolPageLayout symbol={symbol} feature="signal" featureLabel="Bull-Run Signal">
            <BullRunSignalView symbol={symbol} />
        </SymbolPageLayout>
    );
}
