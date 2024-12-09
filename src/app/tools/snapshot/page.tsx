'use client';
import { DeltaGammaHedging } from "@/components/DeltaGammaHedging";
import { useQueryState, parseAsString } from "nuqs";

export default function Page() {
    const [symbol, setSymbol] = useQueryState('symbol', parseAsString);
    if (!symbol) return <div>select a symbol</div>

    return <DeltaGammaHedging symbol={symbol} onClose={() => { }} skipAnimation={true} />
}