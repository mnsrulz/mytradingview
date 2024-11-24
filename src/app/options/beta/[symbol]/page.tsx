import { getCachedSummaryDatesBySymbol } from "@/lib/mzDataService";
import { getCurrentPrice, getOptionData, getOptionExpirations } from "@/lib/tradierService";
import dayjs from "dayjs";
import { C } from "./C";
import { calculateHedging, getCalculatedStrikes } from "@/lib/dgHedgingHelper";

export default async function Page({ params }: { params: { symbol: string } }) {
    const { symbol } = params;
    const strikeCountValue = 20;
    const dte = 30;
    const dataMode = 'Live'

    const cachedDates = await getCachedSummaryDatesBySymbol(symbol);
    const { expirations } = await getOptionExpirations(symbol);
    const expirationsWithDte = expirations.date.map(e => ({ expiration: e, dte: dayjs().diff(e, 'days') })).filter(j=> j.dte <= dte);

    const allOptionChains = await Promise.all(expirationsWithDte.map(async e => {
        return {
            ...e, data: await getOptionData(symbol, e.expiration)
        }
    }));

    const currentPrice = await getCurrentPrice(symbol);
    const allStrikes = getCalculatedStrikes(currentPrice, strikeCountValue, [...new Set(allOptionChains.flatMap(j => j.data.options.option.map(s => s.strike)))]);
    const finalResponse = calculateHedging(allOptionChains.map(j=>j.data), allStrikes, expirationsWithDte.map(j=>j.expiration), currentPrice);

    return <C cachedDates={cachedDates} dte={dte} sc={strikeCountValue} dataMode={dataMode} data={finalResponse.exposureData} symbol={symbol} />;
}