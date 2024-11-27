import { getDexGexAnalysisView } from "@/lib/tradierService";
import { C } from "./C";
import { DexGexType } from "@/lib/types";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";

const ChartWrapper = async (props: { symbol: string, dte: number, tab: DexGexType, strikeCountValue: number }) => {
    const { symbol, dte, tab, strikeCountValue } = props;
    const cachedDates: string[] = [];//await getCachedSummaryDatesBySymbol(symbol);
    const { currentPrice, mappedOptions } = await getDexGexAnalysisView(symbol);
    const dataMode = 'Live'
    return <C cachedDates={cachedDates} dte={dte} sc={strikeCountValue} dataMode={dataMode} data={mappedOptions} symbol={symbol} price={currentPrice} tab={tab} />
}

export default async function Page({ params, searchParams }: { params: { symbol: string }, searchParams: { [key: string]: string | number } }) {
    const search = searchParams;
    const { symbol } = params;
    const strikeCountValue = (search['sc'] || 30) as number;
    const dte = (search['dte'] || 50) as number;
    const tab = (search['tab'] || 'DEX') as DexGexType;

    return <Suspense fallback={<LinearProgress />}>
        <ChartWrapper symbol={symbol} dte={dte} strikeCountValue={strikeCountValue} tab={tab} />
    </Suspense>
}