'use client';
import { useEffect, useState } from 'react';
import { SearchTickerItem, StockPriceData } from './types';
import { io } from 'socket.io-client';
const URL = `https://mztrading-socket.deno.dev`
const WatchlistUpdateFrequency = parseInt(process.env.WATCHLIST_UPDATE_FREQUENCY_MS || '1000');
const socket = io(URL, {
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling']
    // transports: ['websocket']
});

socket.on("connect", () => {
    console.log("Connected to the client!")
})

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

export const subscribeStockPriceBatchRequest = (tickers: SearchTickerItem[]) => {
    socket.emit('stock-price-subscribe-batch-request', { tickers, frequency: WatchlistUpdateFrequency });
}

type VolatilityResponse = {
    dt: string[];
    cv: number[];
    pv: number[];
};
// const dummyVolatilityResponse: VolatilityResponse = {
//     dt: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
//     cv: [0.2, 0.25, 0.22, 0.1, 0.91],
//     pv: [0.18, 0.23, 0.21, 0.15, 0.89]
// }
const defaultVoltility = { dt: [], cv: [], pv: [] }
export const useOptionHistoricalVolatility = (symbol: string, lookbackDays: number, delta: number, strike: number, expiration: string, mode: 'delta' | 'strike') => {
    const [volatility, setVolatility] = useState<VolatilityResponse>(defaultVoltility);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        console.log(`Fetching volatility data for ${symbol} - ${lookbackDays} - ${delta} - ${expiration} - ${mode}`);
        if (!symbol || !expiration) {
            setVolatility(defaultVoltility);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const requestId = crypto.randomUUID();
        const fetchVolatility = async () => {
            socket.once(`volatility-response-${requestId}`, (data: {hasError: boolean, value: VolatilityResponse}) => {
                if(data.hasError) {
                    console.error(`Error fetching volatility data for ${symbol} - ${lookbackDays} - ${delta} - ${expiration} - ${mode}`);
                    setVolatility(defaultVoltility);
                } else {
                    setVolatility(data.value);
                }
                setIsLoading(false);
            });
            socket.emit('query-volatility', {
                symbol,
                lookbackDays,
                delta: mode == 'delta' ? delta: null,
                expiration,
                mode,
                requestId,
                strike: mode == 'strike' ? strike: null
            });
        };
        fetchVolatility();
        return () => { socket.off(`volatility-response-${requestId}`) };
    }, [symbol, lookbackDays, delta, expiration, mode, strike]);
    return { volatility, isLoading };
}