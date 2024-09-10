'use client'
import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import ky from 'ky';
import { NumberRange, OptionsInnerData, SearchTickerItem, StockPriceData, TradierOptionData } from './types';
import { calculateHedging, getCalculatedStrikes } from './dgHedgingHelper';
const WatchlistUpdateFrequency = parseInt(process.env.WATCHLIST_UPDATE_FREQUENCY_MS || '1000');

const URL = `https://mztrading-socket.deno.dev`
// const URL = `https://studious-telegram-4qq55vqj74hqgwp-8000.app.github.dev`

export const socket = io(URL, {
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling']
    // transports: ['websocket']
});

socket.on("connect", () => {
    console.log("Connected")
})


export const searchTicker = async (searchTerm: string, signal?: AbortSignal) => {
    const { items } = await ky('/api/symbols/search', {
        searchParams: {
            q: searchTerm
        },
        signal: signal
    }).json<{
        items: SearchTickerItem[]
    }>();

    return items;
    // return items.quotes.filter(f => f.isYahooFinance).map(r => ({
    //     symbol: r.symbol,
    //     name: r.longname
    // }));
    // return new Promise<SearchTickerResult>((res, rej) => {
    //     socket.emit('stock-list-request', {
    //         q: searchTerm
    //     });

    //     socket.once(`stock-list-response`, (args: SearchTickerResult) => {
    //         res(args);
    //     });
    // });
}

export const useTickerSearch = (v: string) => {
    const [options, setOptions] = useState<SearchTickerItem[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!v) {
            setOptions([]);
            return;
        }
        const ab = new AbortController();
        const getData = async () => {
            setLoading(true);
            try {
                const result = await searchTicker(v, ab.signal);
                setOptions(result);
            } catch (error) {
                //do nothing
            }
            setLoading(false);
        };
        getData();
        return () => { ab.abort(); }
    }, [v]);

    return { options, loading };
}

export const AddTickerToMyList = (item: SearchTickerItem) => {
    socket.emit('mystocks-add-request', item);
}

export const RemoveItemFromMyList = (item: SearchTickerItem) => {
    socket.emit('mystocks-remove-request', item);
}

// export const LoadMyTickerList = () => {
//     return new Promise<SearchTickerItem[]>((res, rej) => {
//         socket.emit('mystocks-list-request');
//         socket.once(`mystocks-list-response`, (args: SearchTickerItem[]) => {
//             res(args);
//             console.log(JSON.stringify(args));
//         });
//     });
// }

export const useMyStockList = () => {
    const [mytickers, setMyTickers] = useState<SearchTickerItem[]>([]);
    const [loading, setIsLoading] = useState(true);
    useEffect(() => {
        ky(`/api/watchlist`).json<{ items: SearchTickerItem[] }>().then(r => {
            setMyTickers(r.items);
            setIsLoading(false);
        });
        // socket.emit('mystocks-list-request');
        // socket.on(`mystocks-list-response`, setMyTickers);
        // return () => {
        //     socket.off('mystocks-list-response', setMyTickers);
        // }
    }, []);

    const addToWatchlist = useCallback((item: SearchTickerItem) => {
        ky.post(`/api/watchlist`, { json: item }).json().then(r => setMyTickers((ii) => [...ii.filter(x => x.symbol != item.symbol), item]));
    }, []);

    const removeFromWatchlist = useCallback((item: SearchTickerItem) => {
        ky.delete(`/api/watchlist`, { json: item }).json().then(r => setMyTickers((ii) => ii.filter(i => i.symbol != item.symbol)));
    }, []);

    return { mytickers, addToWatchlist, removeFromWatchlist, loading };
}


type OptionsData = {
    currentPrice: number,
    options: Record<string, OptionsInnerData>
}
export type OptionsHedgingDataset = { strike: number, [x: string]: number; }

type GammaDeltaDatasetType = {
    dataset: OptionsHedgingDataset[],
    maxPosition: number
}

export type CachedOptionSummaryType = {
    symbol: string, dt: string
}

export type OptionsHedgingData = {
    expirations: string[],
    strikes: number[],
    //data: { puts: number[], calls: number[], data: number[] },
    currentPrice: number,
    deltaDataset: GammaDeltaDatasetType,
    gammaDataset: GammaDeltaDatasetType
}

export const useOptionTracker = (symbol: string) => {
    const [data, setOd] = useState<OptionsData>();
    const [isLoading, setIsLoading] = useState(true);
    const [targetPrice, setTargetPrice] = useState(0);
    const [strikePriceRange, setStrikePriceRange] = useState<NumberRange>({ start: 0, end: Number.MAX_VALUE });

    useEffect(() => {
        setIsLoading(true);
        ky(`/api/symbols/${symbol}/options/analyze`).json<OptionsData>().then(r => {
            setOd(r);
            const { currentPrice } = r;
            const thresholdValue = currentPrice * 0.1;
            // debugger;
            setStrikePriceRange({
                start: Math.round(currentPrice - thresholdValue),
                end: Math.round(currentPrice + thresholdValue)
            });
            setTargetPrice(r.currentPrice);
        }).finally(() => setIsLoading(false));
        // socket.emit('options-subscribe-request', item);
        // socket.on(`options-subscribe-response`, setOd);
        // return () => {
        //     socket.emit('options-unsubscribe-request', item);
        //     socket.off('options-subscribe-response', setOd);
        // }
    }, [symbol]);
    return { data, isLoading, strikePriceRange, setStrikePriceRange, targetPrice, setTargetPrice };
}

export const useCachedDatesData = (symbol: string, dt: string) => {
    const [data, setOd] = useState<TradierOptionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        ky(`https://mztrading-data.deno.dev/data`, {
            searchParams: {
                s: symbol,
                dt
            }
        }).json<TradierOptionData[]>().then(r => {
            setOd(r);
        }).finally(() => setIsLoading(false));
    }, [symbol]);

    return { cachedDatesData: data, isLoadingCachedDatesData: isLoading };
}

export const useCachedDates = (symbol: string) => {
    const [data, setOd] = useState<CachedOptionSummaryType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        ky(`https://mztrading-data.deno.dev/summary`, {
            searchParams: {
                s: symbol
            }
        }).json<{ symbol: string, dt: string }[]>().then(r => {
            setOd(r);
        }).finally(() => setIsLoading(false));
    }, [symbol]);

    return { cachedDates: data, isLoadingCachedDates: isLoading };
}

export const useDeltaGammaHedging = (symbol: string, dte: number, sc: number, dataMode: string) => {
    const [data, setOd] = useState<OptionsHedgingData>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        if (dataMode == 'Live') {
            ky(`/api/symbols/${symbol}/options/analyze/tradier`, {
                searchParams: {
                    dte,
                    sc
                }
            }).json<{ exposureData: OptionsHedgingData }>().then(r => {
                setOd(r.exposureData);
            }).finally(() => setIsLoading(false));
        } else {
            ky(`https://mztrading-data.deno.dev/data`, {
                searchParams: {
                    s: symbol,
                    dt: dataMode
                }
            }).json<{ data: TradierOptionData[] }>().then(async r => {
                const allDates = [...new Set(r.data.flatMap(j => j.options.option.map(s => s.expiration_date)))];
                const { price } = await ky(`/api/symbols/${symbol}/historical`, {
                    searchParams: {
                        dt: dataMode
                    }
                }).json<{ price: number }>();
                const allStrikes = getCalculatedStrikes(price, sc, [...new Set(r.data.flatMap(j => j.options.option.map(s => s.strike)))]);
                const finalResponse = calculateHedging(r.data, allStrikes, allDates, price);
                setOd(finalResponse.exposureData);
            }).finally(() => setIsLoading(false));
        }
    }, [symbol, dte, sc, dataMode]);
    return { data, isLoading };
}

export const useStockPrice = (item: SearchTickerItem) => {
    const [od, setOd] = useState<StockPriceData>();
    // const fn = async () => {
    //     const data = await ky(`/api/symbols/${item.symbol}/summary`).json<StockPriceData>();
    //     setOd(data);
    // }
    useEffect(() => {
        // fn();
        // const i = setInterval(fn, 30000);
        // return () => {
        //     clearInterval(i);
        // }

        socket.emit('stock-price-subscribe-request', { ...item, frequency: WatchlistUpdateFrequency });
        socket.on(`stock-price-subscribe-response-${item.symbol}`, setOd);
        return () => {
            socket.emit('stock-price-unsubscribe-request', item);
            socket.off(`stock-price-subscribe-response-${item.symbol}`, setOd);
        }
    }, [item]);
    return od;
}