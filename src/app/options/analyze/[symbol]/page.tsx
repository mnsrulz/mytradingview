'use client';
import { StockOptionsView } from "@/components/StockOptionsView";
import { useParams } from "next/navigation";

export default function Page() {
    const { symbol } = useParams<{ symbol: string }>()
    return (
        <StockOptionsView symbol={symbol} />
    );
}