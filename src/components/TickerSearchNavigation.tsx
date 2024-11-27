'use client';
import { TickerSearch } from '@/components/TickerSearch';
import { useRouter, useSearchParams } from 'next/navigation';

interface ITickerProps {
    basePath: string,
    label?: string
}

export const TickerSearchNavigation = (props: ITickerProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.toString();

    return <TickerSearch onChange={(v) => {
        let pathToPush = props.basePath ? `${props.basePath}/${v.symbol}` : v.symbol;
        if (searchQuery) pathToPush = `${pathToPush}?${searchQuery}`
        router.push(pathToPush);
    }} />
}
