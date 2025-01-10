import { DexGexType } from "@/lib/types";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";
import { OptionsAnalysisChartWrapper } from "@/components/OptionsAnalysisChartWrapper";

export default async function OptionsAnalysisPage({ params, searchParams }: { params: { symbol: string }, searchParams: { [key: string]: string | number } }) {
    const search = searchParams;
    const { symbol } = params;
    const strikeCount = (search['sc'] || 30) as number;
    const daysToExpiration = (search['dte'] || 50) as number;
    const analysisType = (search['tab'] || 'DEX') as DexGexType;

    return <Suspense fallback={<LinearProgress />}>
        <OptionsAnalysisChartWrapper symbol={symbol} daysToExpiration={daysToExpiration} strikeCount={strikeCount} analysisType={analysisType} />
    </Suspense>
}