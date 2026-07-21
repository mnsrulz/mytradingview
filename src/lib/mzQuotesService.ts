import ky from "ky";
import { useEffect, useMemo, useState } from "react";
const MZQUOTES_URL = process.env.MZINGEST_URL || 'https://mztradingquotes.netlify.app/api';

export const useStockPrice = (input: string | string[]) => {
    // 1. Create a state object to hold just the incoming stream data
    const [quotes, setQuotes] = useState<Record<string, { price: number; change: number; changePercent: number }>>({});

    const symbols = useMemo(() => {
        return (Array.isArray(input) ? input : [input])
            .map(s => s.toUpperCase())
            .filter(Boolean);
    }, [input]);

    useEffect(() => {
        if (!symbols.length) return;

        const es = new EventSource(`${MZQUOTES_URL}/live-quotes?s=${encodeURIComponent(symbols.join(','))}`);
        es.addEventListener('quote', (e) => {
            const { symbol, price, change, changePercent } = JSON.parse(e.data);
            // Batch updates cleanly by changing only the targeted reference
            setQuotes((prev) => ({
                ...prev,
                [symbol]: { price, change, changePercent }
            }));
        });

        es.onopen = () => {
            console.log("SSE connected");
        };

        es.onerror = (err) => {
            console.error("SSE error", err);
        };

        return () => {
            es.close();
        }
    }, [symbols]); // stable dependency

    return { quotes };
}