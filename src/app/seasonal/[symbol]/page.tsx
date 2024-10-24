import { HistoricalSeason } from '@/components/HistoricalSeason';
import { getSeasonalView } from '@/lib/tradierService';

export default async function Page({ params, searchParams }: { params: { symbol: string }, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { symbol } = params;
    const p = await searchParams;
    const mode = p['mode'] as string || 'Monthly';
    const dt = await (mode?.toLowerCase() == 'daily' ? getSeasonalView(symbol, '1y', 'daily') : getSeasonalView(symbol, '5y', 'monthly'));
    return <HistoricalSeason data={dt} symbol={symbol} mode={mode} />;
}