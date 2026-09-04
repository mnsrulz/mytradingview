import ky from "ky";
import { useEffect, useMemo, useState } from "react";
const MZQUOTES_URL = process.env.MZINGEST_URL || 'https://mztradingquotes.netlify.app/api';

export const useStockPrice = (input: string | string[]) => {
    const [quotes, setQuotes] = useState<Record<string, { price: number; change: number; changePercent: number }>>({});
    const [loading, setLoading] = useState(true);

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
            setQuotes((prev) => ({
                ...prev,
                [symbol]: { price, change, changePercent }
            }));
            setLoading(false);
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

    return { quotes, loading };
}