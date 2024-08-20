'use client';
import { DeltaGammaHedging } from "@/components/DeltaGammaHedging";
import { useParams } from "next/navigation";

export default function Page() {
    const { symbol } = useParams<{ symbol: string }>()
    return (
        <DeltaGammaHedging symbol={symbol} onClose={() => { }} />
    );
}