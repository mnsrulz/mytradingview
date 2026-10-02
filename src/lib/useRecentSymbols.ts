'use client';
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = 'beta-recent-symbols';
const MAX_RECENT = 5;
const DEFAULT_SYMBOLS = ['NVDA', 'SPX', 'SPY', 'QQQ', 'AMD'];

export const useRecentSymbols = () => {
    const [recent, setRecent] = useState<string[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setRecent(JSON.parse(stored));
        } catch { /* ignore */ }
        setHydrated(true);
    }, []);

    const add = useCallback((symbol: string) => {
        const upper = symbol.toUpperCase();
        setRecent(prev => {
            const next = [upper, ...prev.filter(s => s !== upper)].slice(0, MAX_RECENT);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
    }, []);

    const display = useMemo(() => {
        if (!hydrated) return DEFAULT_SYMBOLS;
        return recent.length > 0 ? recent : DEFAULT_SYMBOLS;
    }, [recent, hydrated]);

    return { recent, display, isRecent: recent.length > 0, add };
};
