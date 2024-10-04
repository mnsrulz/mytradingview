'use client';
import { TickerSearch } from '@/components/TickerSearch';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    return <div>
        <TickerSearch onChange={(v) => router.push(`/seasonal/${v.symbol}`)} />
    </div>
}
