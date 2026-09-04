import { OptionsExposure } from "@/components/OptionsExposure";
import { getCachedDataForSymbol } from "@/lib/mzDataService";
import { SymbolPageLayout } from "../../SymbolPageLayout";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    const cachedDates = await getCachedDataForSymbol(symbol);

    return (
        <SymbolPageLayout symbol={symbol} feature="options/analyze" featureLabel="DEX/GEX Exposure">
            <OptionsExposure symbol={symbol} cachedDates={cachedDates.map(j => j.dt)} hideSymbolSelector />
        </SymbolPageLayout>
    );
}
