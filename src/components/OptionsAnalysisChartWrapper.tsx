import { getDexGexAnalysisView } from "@/lib/tradierService";
import { DexGexType } from "@/lib/types";
import { getDexGexAnalysisViewCboe } from "@/lib/cboeService";
import { OptionsAnalysisComponent } from "@/components/OptionsAnalysisComponent";

export const OptionsAnalysisChartWrapper = async (props: { symbol: string, daysToExpiration: number, analysisType: DexGexType, strikeCount: number }) => {
    const { symbol, daysToExpiration, analysisType, strikeCount } = props;
    const cachedDates: string[] = [];//await getCachedSummaryDatesBySymbol(symbol);
    const { currentPrice, mappedOptions } = await getDexGexAnalysisView(symbol);
    const dataMode = 'Live';

    return <OptionsAnalysisComponent cachedDates={cachedDates} dte={daysToExpiration} 
        sc={strikeCount} dataMode={dataMode} data={mappedOptions} symbol={symbol} 
        price={currentPrice} tab={analysisType} />
}