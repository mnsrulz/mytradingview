import { getCachedSummaryDatesBySymbol } from "@/lib/mzDataService";
import { getCurrentPrice, getFullOptionChain } from "@/lib/tradierService";
import { C } from "./C";
export default async function Page({ params, searchParams }: { params: { symbol: string }, searchParams: { [key: string]: string | number } }) {
    const search = searchParams;
    const { symbol } = params;
    const strikeCountValue = (search['sc'] || 20) as number;
    const dte = (search['dte'] || 30) as number;
    const dataMode = 'Live'

    const cachedDates = await getCachedSummaryDatesBySymbol(symbol);
    const optionChain = await getFullOptionChain(symbol);


    const currentPrice = await getCurrentPrice(symbol);

    return <C cachedDates={cachedDates} dte={dte} sc={strikeCountValue} dataMode={dataMode} data={optionChain} symbol={symbol} price={currentPrice} />;
}