import { DataModeType, DexGexType } from "@/lib/types";
import { OptionsExposureComponent } from "@/components/OptionsExposureComponent";
import { getCachedDataForSymbol } from "@/lib/mzDataService";
export default async function Page({ params, searchParams }: { params: { symbol: string }, searchParams: { [key: string]: string | number } }) {
    const { symbol } = params;
    const cachedDates = await getCachedDataForSymbol(symbol); //[];//await getCachedSummaryDatesBySymbol(symbol);

    const search = searchParams;
    const strikeCount = (search['sc'] || 30) as number;
    const daysToExpiration = (search['dte'] || 50) as number;
    const analysisType = (search['tab'] || 'DEX') as DexGexType;
    const dataMode = (search['mode'] || 'CBOE') as DataModeType;

    return <OptionsExposureComponent symbol={symbol} dt={cachedDates[0].dt} cachedDates={cachedDates.map(j => j.dt)} dte={daysToExpiration} sc={strikeCount} analysisType={analysisType}  dataMode={dataMode} />
}