import { OptionsExposureComponent } from "@/components/OptionsExposureComponent";
import { getCachedDataForSymbol } from "@/lib/mzDataService";
export default async function Page(
    props: { params: Promise<{ symbol: string }>, searchParams: Promise<{ [key: string]: string | number }> }
) {
    const params = await props.params;
    const { symbol } = params;
    const cachedDates = await getCachedDataForSymbol(symbol); //[];//await getCachedSummaryDatesBySymbol(symbol);
    return <OptionsExposureComponent symbol={symbol} cachedDates={cachedDates.map(j => j.dt)} />
}