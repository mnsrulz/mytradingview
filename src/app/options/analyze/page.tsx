'use client';
import { TickerSearch } from "@/components/ticker-search";
import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter();
    return <TickerSearch onChange={(v) => router.push(`/options/analyze/${v.symbol}`)} />
}