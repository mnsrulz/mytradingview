'use client';
import { TickerSearch } from "@/components/TickerSearch";
import { Container } from "@mui/material";
import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter();
    return <TickerSearch onChange={(v) => router.push(`/options/pricing/${v.symbol}`)} />
}