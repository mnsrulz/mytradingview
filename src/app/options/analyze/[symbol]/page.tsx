import { getCachedSummaryDatesBySymbol } from "@/lib/mzDataService";
import { getCurrentPrice, getFullOptionChain } from "@/lib/tradierService";
import { C } from "./C";
import { Container } from "@mui/material";
import { DexGexType } from "@/lib/types";
export default async function Page({ params, searchParams }: { params: { symbol: string }, searchParams: { [key: string]: string | number } }) {
    const search = searchParams;
    const { symbol } = params;
    const strikeCountValue = (search['sc'] || 30) as number;
    const dte = (search['dte'] || 50) as number;
    const tab = (search['tab'] || 'DEX') as DexGexType;
    const dataMode = 'Live'

    const cachedDates: string[] = [];//await getCachedSummaryDatesBySymbol(symbol);
    const optionChainPromise = getFullOptionChain(symbol);
    const currentPricePromise = getCurrentPrice(symbol);

    await Promise.all([optionChainPromise, currentPricePromise]);
    const optionChain = await optionChainPromise;
    const currentPrice = await currentPricePromise;

    const mappedOptions = optionChain.map(({ strike, expiration_date, greeks, open_interest, option_type, volume }) => ({
        strike, expiration_date, open_interest, option_type, volume, greeks: {
            delta: greeks?.delta || 0,
            gamma: greeks?.gamma || 0,
        }
    }));

    return <C cachedDates={cachedDates} dte={dte} sc={strikeCountValue} dataMode={dataMode} data={mappedOptions} symbol={symbol} price={currentPrice} tab={tab} />
}