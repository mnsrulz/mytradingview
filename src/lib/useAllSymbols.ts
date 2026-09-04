'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import { getAllSymbols } from "@/lib/mzDataService";
import { SearchTickerItem } from "@/lib/types";

type SearchItem = SearchTickerItem & { watchlisted: boolean };

const fuseOptions: IFuseOptions<SearchItem> = {
    keys: [
        { name: 'symbol', weight: 2 },
        { name: 'name', weight: 1 },
        { name: 'watchlisted', weight: 3 },
    ],
    threshold: 0.3,
    includeScore: true,
};

export const useAllSymbols = () => {
    const [symbols, setSymbols] = useState<SearchTickerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const fetched = useRef(false);
    const [watchlistedSet, setWatchlistedSet] = useState<Set<string>>(new Set());

    const enriched = useMemo(() =>
        symbols.map(s => ({
            ...s,
            watchlisted: watchlistedSet.has(s.symbol.toUpperCase()),
        })),
    [symbols, watchlistedSet]);

    const fuse = useMemo(() => new Fuse(enriched, fuseOptions), [enriched]);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        const load = async () => {
            try {
                const result = await getAllSymbols();
                setSymbols(result);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const setWatchlisted = useCallback((symbols: string[]) => {
        setWatchlistedSet(new Set(symbols.map(s => s.toUpperCase())));
    }, []);

    const search = (query: string): SearchTickerItem[] => {
        if (!query) return [];
        return fuse.search(query, { limit: 25 }).map(r => {
            const { watchlisted, ...item } = r.item;
            return item;
        });
    };

    return { symbols, loading, search, setWatchlisted };
};
