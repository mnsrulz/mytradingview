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