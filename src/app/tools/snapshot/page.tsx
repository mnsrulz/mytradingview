'use client';
import { OptionsExposure } from "@/components/OptionsExposure";
import { Typography } from "@mui/material";
import { useQueryState, parseAsString } from "nuqs";

export default function Page() {
    const [symbol, setSymbol] = useQueryState('symbol', parseAsString);
    if (!symbol) return <Typography color="error">select a symbol</Typography>

    return <OptionsExposure symbol={symbol} cachedDates={[]} />
}