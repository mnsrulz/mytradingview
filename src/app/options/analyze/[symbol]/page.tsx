import { getDexGexAnalysisView } from "@/lib/tradierService";
import { C } from "./C";
import { DexGexType } from "@/lib/types";
export default async function Page({ params, searchParams }: { params: { symbol: string }, searchParams: { [key: string]: string | number } }) {
    const search = searchParams;
    const { symbol } = params;
    const strikeCountValue = (search['sc'] || 30) as number;
    const dte = (search['dte'] || 50) as number;
    const tab = (search['tab'] || 'DEX') as DexGexType;
    const dataMode = 'Live'

    const cachedDates: string[] = [];//await getCachedSummaryDatesBySymbol(symbol);
    
    const { currentPrice, mappedOptions } = await getDexGexAnalysisView(symbol);

    return <C cachedDates={cachedDates} dte={dte} sc={strikeCountValue} dataMode={dataMode} data={mappedOptions} symbol={symbol} price={currentPrice} tab={tab} />
}