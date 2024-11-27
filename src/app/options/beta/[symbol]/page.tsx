import { getCachedSummaryDatesBySymbol } from "@/lib/mzDataService";
import { getCurrentPrice, getFullOptionChain } from "@/lib/tradierService";
import { C } from "./C";
import { Container } from "@mui/material";
import { DexGexType } from "@/lib/types";
export default async function Page({ params, searchParams }: { params: { symbol: string }, searchParams: { [key: string]: string | number } }) {
    const search = searchParams;
    const { symbol } = params;
    const strikeCountValue = (search['sc'] || 20) as number;
    const dte = (search['dte'] || 30) as number;
    const tab = (search['tab'] || 'DEX') as DexGexType;
    const dataMode = 'Live'

    const cachedDates: string[] = [];//await getCachedSummaryDatesBySymbol(symbol);
    const optionChain = await getFullOptionChain(symbol);
    const currentPrice = await getCurrentPrice(symbol);

    const mappedOptions = optionChain.map(({ strike, expiration_date, greeks, open_interest, option_type, volume }) => ({
        strike, expiration_date, open_interest, option_type, volume, greeks: {
            delta: greeks?.delta || 0,
            gamma: greeks?.gamma || 0,
        }
    }));

    return <Container maxWidth="md">
        <C cachedDates={cachedDates} dte={dte} sc={strikeCountValue} dataMode={dataMode} data={mappedOptions} symbol={symbol} price={currentPrice} tab={tab} />
    </Container>
}