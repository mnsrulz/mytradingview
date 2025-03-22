'use client';
import { OptionsExposureComponent } from "@/components/OptionsExposureComponent";
import { useQueryState, parseAsString } from "nuqs";

export default function Page() {
    const [symbol, setSymbol] = useQueryState('symbol', parseAsString);
    if (!symbol) return <div>select a symbol</div>

    return <OptionsExposureComponent symbol={symbol} cachedDates={[]} />
}