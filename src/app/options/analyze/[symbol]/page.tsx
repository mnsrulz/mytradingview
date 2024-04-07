'use client';
import { StockOptionsView } from "@/components/stock-options-view";
import { useParams } from "next/navigation";

export default function Page() {
    const { symbol } = useParams<{ symbol: string }>()
    return (
        <StockOptionsView symbol={symbol} />
    );
}