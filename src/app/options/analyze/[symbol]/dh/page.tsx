'use client';
import { DeltaHeding } from "@/components/delta-heding";
import { useParams } from "next/navigation";

export default function Page() {
    const { symbol } = useParams<{ symbol: string }>()
    return (
        <DeltaHeding symbol={symbol} onClose={() => { }} />
    );
}