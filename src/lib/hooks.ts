import { useCallback, useEffect, useState } from 'react';
import ky from 'ky';
import { NumberRange, OptionsInnerData, SearchTickerItem, TradierOptionData } from './types';
import { calculateHedging, getCalculatedStrikes } from './dgHedgingHelper';
import dayjs from 'dayjs';
import { useLocalStorage } from '@uidotdev/usehooks';
import { searchTicker } from './mzDataService';

export const useMyStockList = (initialState: SearchTickerItem[] | undefined) => {
    const [mytickers, setMyTickers] = useState<SearchTickerItem[]>(initialState || []);
    const [loading, setIsLoading] = useState(initialState === undefined);
    useEffect(() => {
        if (!initialState) {
            ky(`/api/watchlist`).json<{ items: SearchTickerItem[] }>().then(r => {
                setMyTickers(r.items);
                setIsLoading(false);
            });
        }
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

export type CachedReleaseSymbolType = {
    name: string,
    assetUrl: string
}

export type OptionsHedgingData = {
    expirations: string[],
    strikes: number[],
    currentPrice: number,
    deltaDataset: GammaDeltaDatasetType,
    gammaDataset: GammaDeltaDatasetType,
    oiDataset: GammaDeltaDatasetType,
    volumeDataset: GammaDeltaDatasetType,
}

export const useOptionTracker = (symbol: string) => {
    const [data, setOd] = useState<OptionsData>();
    const [isLoading, setIsLoading] = useState(true);
    const [targetPrice, setTargetPrice] = useState(0);
    const [costBasis, setCostBasis] = useState(0);
    const [strikePriceRange, setStrikePriceRange] = useState<NumberRange>({ start: 0, end: Number.MAX_VALUE });

    useEffect(() => {
        setIsLoading(true);
        ky(`/api/symbols/${symbol}/options/analyze`).json<OptionsData>().then(r => {
            setOd(r);
            const { currentPrice } = r;
            const thresholdValue = currentPrice * 0.1;
            setStrikePriceRange({
                start: Math.round(currentPrice - thresholdValue),
                end: Math.round(currentPrice + thresholdValue)
            });
            setTargetPrice(r.currentPrice);
            setCostBasis(r.currentPrice);
        }).finally(() => setIsLoading(false));
    }, [symbol]);
    return { data, isLoading, strikePriceRange, setStrikePriceRange, targetPrice, setTargetPrice, costBasis, setCostBasis };
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
    }, [symbol, dt]);

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

export const useCachedReleaseSymbolData = (dt: string) => {
    const [data, setOd] = useState<CachedReleaseSymbolType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        ky(`https://mztrading-data.deno.dev/releases/symbols?r=${dt}`).json<CachedReleaseSymbolType[]>().then(r => {
            r.forEach(m => m.assetUrl = `https://mztrading-data.deno.dev/images?dt=${dt}&s=${m.name}`);
            setOd(r);
        }).finally(() => setIsLoading(false));
    }, [dt]);

    return { cachedSummarySymbolsData: data, isLoadingCachedSummaryData: isLoading };
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
            }).json<{ data: TradierOptionData[], price: number }>().then(async r => {
                const filteredData = r.data.filter(r => dayjs(r.options.option.at(0)?.expiration_date) <= dayjs(dataMode).add(dte, 'day'));
                const allDates = [...new Set(filteredData.flatMap(j => j.options.option.map(s => s.expiration_date)))];
                let priceAtDate = r.price;  //it's possible that we won't receive the data from data service so fall back to netlify...
                if(!priceAtDate) {
                    const { price } = await ky(`/api/symbols/${symbol}/historical`, {
                        searchParams: {
                            dt: dataMode
                        }
                    }).json<{ price: number }>();
                    priceAtDate = price;
                }
                const allStrikes = getCalculatedStrikes(priceAtDate, sc, [...new Set(filteredData.flatMap(j => j.options.option.map(s => s.strike)))]);
                const finalResponse = calculateHedging(filteredData, allStrikes, allDates, priceAtDate);
                setOd(finalResponse.exposureData);
            }).finally(() => setIsLoading(false));
        }
    }, [symbol, dte, sc, dataMode]);
    return { data, isLoading };
};

export const useDeltaGammaHedgingV2 = (symbol: string, dte: number, sc: number, dataMode: string) => {
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
                const filteredData = r.data.filter(r => dayjs(r.options.option.at(0)?.expiration_date) <= dayjs(dataMode).add(dte, 'day'));
                const allDates = [...new Set(filteredData.flatMap(j => j.options.option.map(s => s.expiration_date)))];
                const { price } = await ky(`/api/symbols/${symbol}/historical`, {
                    searchParams: {
                        dt: dataMode
                    }
                }).json<{ price: number }>();
                const allStrikes = getCalculatedStrikes(price, sc, [...new Set(filteredData.flatMap(j => j.options.option.map(s => s.strike)))]);
                const finalResponse = calculateHedging(filteredData, allStrikes, allDates, price);
                setOd(finalResponse.exposureData);
            }).finally(() => setIsLoading(false));
        }
    }, [symbol, dte, sc, dataMode]);
    return { data, isLoading };
};

export const useMyLocalWatchList = () => {
    const initialState = [
        {
            "symbol": "NVDA",
            "name": "NVIDIA Corporation"
        },
        {
            "symbol": "QQQ",
            "name": "Invesco QQQ Trust"
        },
        {
            "symbol": "MSFT",
            "name": "Microsoft Corporation"
        },
        {
            "symbol": "AMD",
            "name": "Advanced Micro Devices, Inc."
        },
        {
            "symbol": "TSM",
            "name": "Taiwan Semiconductor Manufacturing Company Limited"
        }
    ];
    const [wl, setWl] = useLocalStorage("localwatchlist", initialState);

    const removeFromMyList = (item: SearchTickerItem) => {
        setWl(v => v.filter((ticker) => ticker.symbol != item.symbol));
    };

    const addToMyList = (item: SearchTickerItem) => {
        setWl(v => {
            const items = v.filter((ticker) => ticker.symbol != item.symbol); //ensuring we are not adding the same item again.
            items.push(item);
            return items;
        });
    };

    return { wl, removeFromMyList, addToMyList };
};

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
        return () => { ab.abort(); };
    }, [v]);

    return { options, loading };
};

