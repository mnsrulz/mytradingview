'use client';
import { useEffect, useState } from 'react';
import { SearchTickerItem, StockPriceData } from './types';
import { io } from 'socket.io-client';
const URL = process.env.MZDATA_SOCKET_URL || `https://mztrading-socket.deno.dev`;
const WatchlistUpdateFrequency = parseInt(process.env.WATCHLIST_UPDATE_FREQUENCY_MS || '1000');
const TrackPageInterval = parseInt(process.env.TRACK_PAGE_INTERVAL_MS || '9000');
const socket = io(URL, {
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling']
    // transports: ['websocket']
});

socket.on("connect", () => {
    console.log("Connected to the client!")
})

export const useTrackPage = (pathName: string) => {
    useEffect(() => {
        const timer = setInterval(() => {
            socket.volatile.emit('track-page', {
                pageUrl: pathName,
            });
        }, TrackPageInterval);

        return () => {
            clearInterval(timer);
            socket.volatile.emit('untrack-page', {
                pageUrl: pathName,
            });
        }
    }, [pathName]);
}

export const useStockPrice = (item: SearchTickerItem) => {
    const [stockPrice, setStockPrice] = useState<StockPriceData>();
    useEffect(() => {
        socket.emit('stock-price-subscribe-request', { ...item, frequency: WatchlistUpdateFrequency });
        socket.on(`stock-price-subscribe-response-${item.symbol}`, setStockPrice);
        return () => {
            socket.emit('stock-price-unsubscribe-request', item);
            socket.off(`stock-price-subscribe-response-${item.symbol}`, setStockPrice);
        }
    }, [item]);
    return stockPrice;
}

export const useLivePageTrackingViews = () => {
    const [views, setViews] = useState<{ page: string, count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const handleDataCb = (data: any) => {
        setIsLoading(false);
        setViews(data);
    };
    useEffect(() => {
        socket.timeout(3000).emitWithAck('list-active-page-tracking').then(handleDataCb);
        const timer = setInterval(() => {
            socket.timeout(3000).emitWithAck('list-active-page-tracking').then(handleDataCb);
        }, 3000);
        return () => { clearInterval(timer); }
    }, []);
    return { views, isLoading };
}

export const subscribeStockPriceBatchRequest = (tickers: SearchTickerItem[]) => {
    socket.volatile.emit('stock-price-subscribe-batch-request', { tickers, frequency: WatchlistUpdateFrequency });
}

export type VolatilityResponse = {
    dt: string[];
    cv: number[];
    pv: number[];
    cp: number[];
    pp: number[];
    iv30: number[];
    close: number[];
};
// const dummyVolatilityResponse: VolatilityResponse = {
//     dt: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
//     cv: [0.2, 0.25, 0.22, 0.1, 0.91],
//     pv: [0.18, 0.23, 0.21, 0.15, 0.89]
// }
const defaultVoltility = { dt: [], cv: [], pv: [], cp: [], pp: [], iv30: [], close: [], straddle: [] }
export const useOptionHistoricalVolatility = (symbol: string, lookbackDays: number, delta: number, strike: number, expiration: string, mode: 'delta' | 'strike') => {
    const [volatility, setVolatility] = useState<VolatilityResponse & { straddle: number[] }>(defaultVoltility);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log(`Fetching volatility data for ${symbol} - ${lookbackDays} - ${delta} - ${expiration} - ${mode}`);
        if (!symbol || !expiration) {
            setVolatility(defaultVoltility);
            setIsLoading(true);
            return;
        }
        setIsLoading(true);
        setHasError(false);
        setError('');
        const requestId = crypto.randomUUID();
        const timeoutSeconds = 10;
        const noResponseSignal = setTimeout(() => {
            socket.emit('log-message', {
                message: `Failed to receive the response for fetching volatility within ${timeoutSeconds} seconds. Request Id: ${requestId},  ${symbol} - ${lookbackDays} - ${delta} - ${expiration} - ${mode}`
            });
            setHasError(true);
            setError(`Failed to receive the response for fetching volatility within ${timeoutSeconds} seconds. Please try again.`)
        }, timeoutSeconds * 1000);
        const fetchVolatility = () => {
            socket.once(`volatility-response-${requestId}`, (data: { hasError: boolean, value: VolatilityResponse }) => {
                clearTimeout(noResponseSignal);
                if (data.hasError || !data.value?.dt) { //checking dt, if it's null, likely there's no data returned from server.
                    setHasError(true);
                    setError(`Error fetching volatility data for ${symbol}. Please try again later or choose a different symbol. If problem persist, report via contact us page.`);
                    setVolatility(defaultVoltility);
                } else {
                    setHasError(false);
                    setError('');
                    const straddle = data.value.cp.map((v, x) => data.value.pp[x] + v);
                    setVolatility({ ...data.value, straddle });
                }
                setIsLoading(false);
            });
            socket.emit('query-volatility', {
                symbol,
                lookbackDays,
                delta: mode == 'delta' ? delta : null,
                expiration,
                mode,
                requestId,
                strike: mode == 'strike' ? strike : null
            });
        };
        fetchVolatility();
        return () => { socket.off(`volatility-response-${requestId}`); clearTimeout(noResponseSignal); };
    }, [symbol, lookbackDays, delta, expiration, mode, strike]);
    return { volatility, isLoading, hasError, error };
}