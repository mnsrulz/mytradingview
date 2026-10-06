'use client';
import { useEffect, useMemo, useState } from 'react';
import { runBullRunSignalQuery } from '@/lib/socket';
import { deriveSummary } from './derive';
import { normalizeWeeks } from './normalize';
import { BullRunSummary, BullRunWeek, BULL_RUN_LOOKBACK_DAYS, MIN_BULL_RUN_WEEKS } from './types';

const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

type CacheEntry = { fetchedAt: number; rows: BullRunWeek[] };
const cache = new Map<string, CacheEntry>();

export interface BullRunSignalState {
    rows: BullRunWeek[];
    badge: BullRunWeek | null;
    summary: BullRunSummary | null;
    isLoading: boolean;
    error: string | undefined;
    noData: boolean;
    insufficientHistory: boolean;
}

export const useBullRunSignal = (symbol: string): BullRunSignalState => {
    const [rows, setRows] = useState<BullRunWeek[] | null>(
        () => cache.get(symbol)?.rows ?? null,
    );
    const [isLoading, setLoading] = useState(() => !cache.has(symbol));
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        const hit = cache.get(symbol);
        if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) {
            setRows(hit.rows);
            setLoading(false);
            setError(undefined);
            return;
        }

        const ac = new AbortController();
        setLoading(true);
        setError(undefined);

        runBullRunSignalQuery(symbol, BULL_RUN_LOOKBACK_DAYS, ac.signal)
            .then(raw => {
                const normalized = normalizeWeeks(raw);
                cache.set(symbol, { fetchedAt: Date.now(), rows: normalized });
                setRows(normalized);
                setLoading(false);
            })
            .catch((err: unknown) => {
                if (ac.signal.aborted) return;
                setError(err instanceof Error ? err.message : String(err));
                setLoading(false);
            });

        return () => ac.abort();
    }, [symbol]);

    const summary = useMemo(() => (rows ? deriveSummary(rows) : null), [rows]);
    const noData = !!rows && rows.length === 0;
    const insufficientHistory =
        !!rows && rows.length > 0 && rows.length < MIN_BULL_RUN_WEEKS;

    return {
        rows: rows ?? [],
        badge: summary?.badge ?? null,
        summary,
        isLoading,
        error,
        noData,
        insufficientHistory,
    };
};
