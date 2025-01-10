'use client';
import { TickerSearch } from "@/components/TickerSearch";
import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter();
    return <TickerSearch onChange={(v) => router.push(`/options/legacy/${v.symbol}`)} />
}