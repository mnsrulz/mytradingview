'use client';
import { TickerSearch } from '@/components/TickerSearch';
import { useRouter } from 'next/navigation';

interface ITickerProps {
    basePath: string,
    label?: string
}

export const TickerSearchNavigation = (props: ITickerProps) => {
    const router = useRouter();
    return <TickerSearch onChange={(v) => router.push(`${props.basePath}/${v.symbol}`)} />
}