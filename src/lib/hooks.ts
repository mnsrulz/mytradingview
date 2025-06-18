import { useCallback, useEffect, useState } from 'react';
import ky from 'ky';
import { DataModeType, DexGexType, NumberRange, OptionsInnerData, OptionsPricingDataResponse, SearchTickerItem, ExposureSnapshotByDateResponse, TradierOptionData, ExposureDataResponse } from './types';
import { calculateHedging, getCalculatedStrikes } from './dgHedgingHelper';
import dayjs from 'dayjs';
import { useLocalStorage } from '@uidotdev/usehooks';
import { getHistoricalOptionExposure, getLiveCboeOptionExposure, searchTicker, getEmaDataForExpsoure, getOptionsPricing, getExposureSnapshotByDate, getAvailableExposureDates } from './mzDataService';

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


export type OptionsHedgingDataset = { strike: number, [x: string]: number; }

export type GammaDeltaDatasetType = {
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
    const [data, setOd] = useState<OptionsPricingDataResponse>();
    const [isLoading, setIsLoading] = useState(true);
    const [targetPrice, setTargetPrice] = useState(0);
    const [costBasis, setCostBasis] = useState(0);
    const [strikePriceRange, setStrikePriceRange] = useState<NumberRange>({ start: 0, end: Number.MAX_VALUE });

    useEffect(() => {
        setIsLoading(true);
        ky(`/api/symbols/${symbol}/options/analyze`).json<OptionsPricingDataResponse>().then(r => {
            setOd(r);
            const { spotPrice: currentPrice } = r;
            const thresholdValue = currentPrice * 0.1;
            setStrikePriceRange({
                start: Math.round(currentPrice - thresholdValue),
                end: Math.round(currentPrice + thresholdValue)
            });
            setTargetPrice(r.spotPrice);
            setCostBasis(r.spotPrice);
        }).finally(() => setIsLoading(false));
    }, [symbol]);
    return { data, isLoading, strikePriceRange, setStrikePriceRange, targetPrice, setTargetPrice, costBasis, setCostBasis };
}

export const useSnapshotImagesData = (dt: string) => {
    const [data, setOd] = useState<ExposureSnapshotByDateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getExposureSnapshotByDate(dt).then(setOd).finally(() => setIsLoading(false));
    }, [dt]);

    return { cachedSummarySymbolsData: data, isLoadingCachedSummaryData: isLoading };
}

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

// export const useHistoricalCacheData = (symbol: string, date: string) => {
//     const [data, setData] = useState<MiniOptionContract[]>([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (!date || !symbol) {
//             setData([]);
//             return;
//         }
//         setLoading(true);
//         getCachedDataForSymbolByDate(symbol, date).then(r => {
//             setData(r.map(j => {
//                 return {
//                     expiration_date: j.expiration,
//                     strike: j.strike,
//                     option_type: j.option_type == 'C' ? 'call' : 'put',
//                     open_interest: j.open_interest,
//                     volume: j.volume,
//                     greeks: {
//                         delta: j.delta,
//                         gamma: j.gamma,
//                     }
//                 }
//             }));
//             setLoading(false);
//         })
//     }, [symbol, date]);

//     return { data, loading };
// }

// export const useCboeOptions = (symbol: string) => {
//     const [data, setData] = useState<{ data: MiniOptionContract[], currentPrice: number }>({ data: [], currentPrice: 0 });
//     const [loaded, setLoaded] = useState(false);
//     useEffect(() => {
//         getFullOptionChainCboe(symbol).then(data => {
//             const mappedOptions = data.data.map(j => {
//                 return {
//                     expiration_date: j.expiration_date,
//                     option_type: j.option_type,
//                     strike: j.strike,
//                     open_interest: j.open_interest,
//                     volume: j.volume,
//                     greeks: {
//                         delta: j.delta,
//                         gamma: j.gamma
//                     }
//                 }
//             })
//             setData({ data: mappedOptions, currentPrice: data.currentPrice });
//             setLoaded(true);
//         })
//     }, [symbol]);
//     return { data, loaded };
// }

// export const useCboeOptionsV2 = (symbol: string) => {
//     const [spotPrice, setSpotPrice] = useState(0);
//     const [indexedData, setIndexedData] = useState<IndexedOptionDataType>({});
//     const [isLoaded, setLoaded] = useState(false)
//     useEffect(() => {
//         setLoaded(false);
//         getFullOptionChainCboe(symbol).then(data => {
//             const timingLogId = `indexing-${symbol}`;
//             console.time(timingLogId);
//             const indexedObject = data.data.reduce((previous, current) => {
//                 previous[current.expiration_date] = previous[current.expiration_date] || {};
//                 previous[current.expiration_date][current.strike] = previous[current.expiration_date][current.strike] || {};
//                 //does it make sense to throw exception if delta/gamma values doesn't seem accurate? like gamma being negative or delta being greater than 1?
//                 if (current.option_type == 'call') {
//                     previous[current.expiration_date][current.strike].call = { oi: current.open_interest, volume: current.volume, delta: current.delta, gamma: current.gamma };
//                 } else {
//                     previous[current.expiration_date][current.strike].put = { oi: current.open_interest, volume: current.volume, delta: current.delta, gamma: current.gamma };
//                 }
//                 return previous;
//             }, {} as Record<string, Record<string, MicroOptionContract>>)
//             console.timeEnd(timingLogId);
//             setIndexedData(indexedObject);
//             setSpotPrice(data.currentPrice);
//             setLoaded(true);
//         });
//     }, [symbol]);
//     return { isLoaded, indexedData, spotPrice };
// }

// type MicroOptionContractItem = { oi: number, volume: number, delta: number, gamma: number }
// type MicroOptionContract = { call: MicroOptionContractItem, put: MicroOptionContractItem }
// type DexGexChartData = { expiration: string; data: number[]; }
// type IndexedOptionDataType = Record<string, Record<string, MicroOptionContract>>


// export const calculateChartData = (indexedData: IndexedOptionDataType, spotPrice: number, dte: number, strikeCount: number) => {
//     const timingLogId = `calculateChartData`;
//     console.time(timingLogId);

//     const tillDate = dayjs().add(dte, 'day');
//     const filteredData = Object.keys(indexedData).filter(r => dayjs(r) <= tillDate).reduce((prev, c) => {
//         prev[c] = indexedData[c];
//         return prev;
//     }, {} as Record<string, Record<string, MicroOptionContract>>);
//     const allAvailableStikesForFilteredExpirations = Object.values(filteredData).map(j => Object.keys(j)).reduce((prev, c) => {
//         c.forEach(k => prev.add(Number(k)));
//         return prev;
//     }, new Set<number>());

//     const strikes = getCalculatedStrikes(spotPrice, strikeCount, [...allAvailableStikesForFilteredExpirations]);
//     const expirations = Object.keys(filteredData);
//     const data = [] as { expiration: string; openInterestData: number[]; volumeData: number[], deltaData: number[], gammaData: number[] }[];

//     for (const expiration of expirations) {
//         const callOpenInterestData = new Array<number>(strikes.length).fill(0);
//         const putOpenInterestData = new Array<number>(strikes.length).fill(0);

//         const callVolumeData = new Array<number>(strikes.length).fill(0);
//         const putVolumeData = new Array<number>(strikes.length).fill(0);

//         const callDeltaData = new Array<number>(strikes.length).fill(0);
//         const putDeltaData = new Array<number>(strikes.length).fill(0);

//         const callGammaData = new Array<number>(strikes.length).fill(0);
//         const putGammaData = new Array<number>(strikes.length).fill(0);

//         for (let ix = 0; ix < strikes.length; ix++) {
//             callOpenInterestData[ix] = -(filteredData[expiration][strikes[ix]]?.call?.oi || 0);
//             putOpenInterestData[ix] = filteredData[expiration][strikes[ix]]?.put?.oi || 0;

//             callVolumeData[ix] = -(filteredData[expiration][strikes[ix]]?.call?.volume || 0);
//             putVolumeData[ix] = filteredData[expiration][strikes[ix]]?.put?.volume || 0;

//             callDeltaData[ix] = -Math.trunc((filteredData[expiration][strikes[ix]]?.call?.delta || 0) * 100 * callOpenInterestData[ix] * spotPrice);
//             putDeltaData[ix] = Math.trunc((filteredData[expiration][strikes[ix]]?.put?.volume || 0) * 100 * putOpenInterestData[ix] * spotPrice);

//             const callGamma = (filteredData[expiration][strikes[ix]]?.call?.gamma || 0) * 100 * callOpenInterestData[ix] * spotPrice;
//             const putGamma = (filteredData[expiration][strikes[ix]]?.put?.gamma || 0) * 100 * putOpenInterestData[ix] * spotPrice;
//             const netGamma = Math.trunc(callGamma - putGamma);
//             callGammaData[ix] = netGamma > 0 ? 0 : -netGamma;
//             putGammaData[ix] = netGamma > 0 ? 0 : netGamma;
//         }

//         data.push({ openInterestData: callOpenInterestData, expiration, volumeData: callVolumeData, deltaData: callDeltaData, gammaData: callGammaData });
//         data.push({ openInterestData: putOpenInterestData, expiration, volumeData: putVolumeData, deltaData: putDeltaData, gammaData: putGammaData });
//     }
//     console.timeEnd(timingLogId);
//     return { data, strikes, expirations };
// }

export type ExposureDataType = { items: { data: number[], expiration: string }[], strikes: number[], expirations: string[], spotPrice: number, maxPosition: number, putWall: string, callWall: string, gammaWall: string, volTrigger: string, timestamp?: Date }

const mapChartValues = (mp: Map<number, number>, skts: Map<number, number>, values: number[]) => {
    const nodes = new Float64Array(mp.size).fill(0);

    for (const o of mp.keys()) {    //[100,0]   //may be we don't need mp map, just an array would work too
        const iix = skts.get(o);
        const mpiix = mp.get(o);
        if (iix !== undefined && mpiix !== undefined) {
            nodes[mpiix] = values[iix];
        }
    }

    // for (let ix = 0; ix < skts.length; ix++) {
    //     const nix = mp.get(Number(skts[ix]));
    //     if (nix !== undefined) {
    //         nodes[nix] = values[ix];
    //     }
    // }
    return Array.from(nodes);
}

const calcMaxValue = (len: number, data: (number[] | Float64Array)[]) => {
    const callData = new Array<number>(len).fill(0);
    const putData = new Array<number>(len).fill(0);
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < len; j++) {
            if (data[i][j] > 0) {
                callData[j] += data[i][j]
            } else {
                putData[j] += data[i][j]
            }
        }
    }
    const maxValue = Math.max(Math.abs(Math.max(...callData)), Math.abs(Math.min(...putData)));
    return maxValue;
}

const getLiveExposure = (symbol: string, provider: 'CBOE' | 'TRADIER') => {
    return provider == 'CBOE' ? getLiveCboeOptionExposure(symbol) : getLiveTradierOptionExposure(symbol)
}

const getLiveTradierOptionExposure = async (symbol: string) => {
    return await ky(`/api/symbols/${symbol}/options/exposure`).json<ExposureDataResponse>();
}

//This hook has potential performance issues
export const useOptionExposure = (symbol: string, dte: number, selectedExpirations: string[], strikeCount: number, chartType: DexGexType, dataMode: DataModeType, dt: string, refreshToken: string) => {
    const [rawExposureResponse, setRawExposureResponse] = useState<ExposureDataResponse>();
    const [exposureData, setExposureData] = useState<ExposureDataType>();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [cacheStore, setCache] = useState<Record<string, ExposureDataResponse>>({});
    const expirationData = rawExposureResponse?.data.map(({ dte, expiration }) => ({ dte, expiration })) || [];
    // const [emaData, setEmaData] = useState<{ ema9d: number, ema21d: number }>();

    // useEffect(() => {
    //     if (emaData) return;
    //     getEmaDataForExpsoure(symbol).then(setEmaData);
    // }, [symbol]);



    useEffect(() => {
        setHasError(false);
        const cacheKey = dataMode == DataModeType.HISTORICAL ? `${symbol}-${dt}` : `${symbol}-${refreshToken}-${dataMode}`;
        if (cacheStore[cacheKey]) {
            setRawExposureResponse(cacheStore[cacheKey]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const exposureResponse = dataMode == DataModeType.HISTORICAL ? getHistoricalOptionExposure(symbol, dt) : getLiveExposure(symbol, dataMode);
        exposureResponse.then(data => {
            setCache((prev) => { prev[cacheKey] = data; return prev; });
            for (const d of data.data) {  //for better performance, we are converting the strikes to number only once
                d.strikesMap = new Map(d.strikes.map((j, ix) => [Number(j), ix]));
            }
            setRawExposureResponse(data);
        }).catch(() => {
            setHasError(true);
        }).finally(() => setIsLoading(false))
    }, [symbol, dt, dataMode, refreshToken]);

    useEffect(() => {
        if (!rawExposureResponse) return;
        const start = performance.now();
        const filteredData = dte > 0 ? rawExposureResponse.data.filter(j => j.dte <= dte) : rawExposureResponse.data.filter(j => selectedExpirations.includes(j.expiration));
        const expirations = filteredData.map(j => j.expiration);

        const allAvailableStikesForFilteredExpirations = new Set<number>();
        for (const { strikes } of filteredData) {
            for (const strike of strikes) {
                allAvailableStikesForFilteredExpirations.add(Number(strike));
            }
        }

        const strikes = getCalculatedStrikes(rawExposureResponse.spotPrice, strikeCount, [...allAvailableStikesForFilteredExpirations]);
        const strikesIndexMap = new Map<number, number>();
        strikes.forEach((j, ix) => strikesIndexMap.set(j, ix));
        const exposureDataValue: ExposureDataType = { expirations, strikes, spotPrice: rawExposureResponse.spotPrice, maxPosition: 0, items: [], callWall: '0', putWall: '0', gammaWall: '0', volTrigger: '0', timestamp: rawExposureResponse.timestamp };
        switch (chartType) {
            case 'GEX':
                const callWallMap = {} as Record<string, number>;
                const putWallMap = {} as Record<string, number>;
                const netGammaMap = {} as Record<string, number>;

                filteredData.forEach(k => {
                    k.strikes.forEach((s, ix) => {
                        const strike = Number(s);
                        callWallMap[strike] = (callWallMap[strike] || 0) + k.call.absGamma[ix]
                        putWallMap[strike] = (putWallMap[strike] || 0) + k.put.absGamma[ix];
                        netGammaMap[strike] = (netGammaMap[strike] || 0) + (k.netGamma[ix]);
                    })
                })
                exposureDataValue.callWall = Object.keys(callWallMap).reduce((a, b) => callWallMap[a] > callWallMap[b] ? a : b, "");
                exposureDataValue.putWall = Object.keys(putWallMap).reduce((a, b) => putWallMap[a] > putWallMap[b] ? a : b, "");

                const gammaWallResult = Object.keys(callWallMap).reduce((a, b) => {
                    if ((callWallMap[b] + putWallMap[b]) > a.maxGamma) {
                        a.maxGamma = callWallMap[b] + putWallMap[b];
                        a.strike = b;
                    }
                    return a;
                }, { maxGamma: 0, strike: "" });

                exposureDataValue.gammaWall = gammaWallResult.strike;
                
                // Calculate VOLTRIGGER -- vol trigger is a strike where the net gamma flips from positive to negative
                const sortedStrikes = Object.keys(netGammaMap)
                    .map(Number)
                    .sort((a, b) => a - b);

                for (let i = 1; i < sortedStrikes.length; i++) {
                    const prevStrike = sortedStrikes[i - 1];
                    const currStrike = sortedStrikes[i];
                    const prevGamma = netGammaMap[prevStrike];
                    const currGamma = netGammaMap[currStrike];

                    if (prevGamma > 0 && currGamma < 0) {
                        exposureDataValue.volTrigger = currStrike.toString();
                        break;
                    }
                }

                exposureDataValue.items = filteredData.map(j => {
                    return {
                        expiration: j.expiration,
                        data: mapChartValues(strikesIndexMap, j.strikesMap, j.netGamma)
                    }
                })
                break;
            case 'DEX':
                exposureDataValue.items = filteredData.flatMap(j => {
                    return [{
                        expiration: j.expiration,
                        data: mapChartValues(strikesIndexMap, j.strikesMap, j.call.absDelta)
                    }, {
                        expiration: j.expiration,
                        data: mapChartValues(strikesIndexMap, j.strikesMap, j.put.absDelta)
                    }]
                })
                break;
            case 'OI':
                exposureDataValue.items = filteredData.flatMap(j => {
                    return [{
                        expiration: j.expiration,
                        data: mapChartValues(strikesIndexMap, j.strikesMap, j.call.openInterest)
                    }, {
                        expiration: j.expiration,
                        data: mapChartValues(strikesIndexMap, j.strikesMap, j.put.openInterest.map(v => -v))
                    }]
                })
                break;
            case 'VOLUME':
                exposureDataValue.items = filteredData.flatMap(j => {
                    return [{
                        expiration: j.expiration,
                        data: mapChartValues(strikesIndexMap, j.strikesMap, j.call.volume)
                    }, {
                        expiration: j.expiration,
                        data: mapChartValues(strikesIndexMap, j.strikesMap, j.put.volume.map(v => -v))
                    }]
                })
                break;
            default:
                throw new Error('invalid chart type');
        }

        exposureDataValue.maxPosition = calcMaxValue(strikes.length, exposureDataValue.items.map(j => j.data));
        setExposureData(exposureDataValue);
        const end = performance.now();
        console.log(`exposure-calculation took ${end - start}ms`);
    }, [rawExposureResponse, chartType, dte, strikeCount, selectedExpirations]);

    return {
        exposureData, isLoading, hasError, expirationData
        // , emaData

    };
}

export const useOptionTrackerV2 = (symbol: string, refreshToken: string) => {
    const [data, setOd] = useState<OptionsPricingDataResponse>();
    const [isLoading, setIsLoading] = useState(true);
    const [targetPrice, setTargetPrice] = useState(0);
    const [costBasis, setCostBasis] = useState(0);
    const [strikePriceRange, setStrikePriceRange] = useState<NumberRange>({ start: 0, end: Number.MAX_VALUE });

    useEffect(() => {
        setIsLoading(true);

        getOptionsPricing(symbol).then(r => {
            setOd(r);
            const { spotPrice } = r;
            const thresholdValue = spotPrice * 0.1;
            setStrikePriceRange({
                start: Math.round(spotPrice - thresholdValue),
                end: Math.round(spotPrice + thresholdValue)
            });
            setTargetPrice(spotPrice);
            setCostBasis(spotPrice);
        }).finally(() => setIsLoading(false));
    }, [symbol, refreshToken]);
    return { data, isLoading, strikePriceRange, setStrikePriceRange, targetPrice, setTargetPrice, costBasis, setCostBasis };
}


export const useExporsureDates = () => {
    const [cachedDates, setCachedDates] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setIsLoading(true)
        getAvailableExposureDates().then(async k => {
            if (k && k.length > 0) {
                setCachedDates(k.map(j => j.dt).sort().reverse());
            }
        }).catch((err) => {
            setError(`Error occurred! Please try again later.`);
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);
    return {
        cachedDates,
        error,
        isLoading
    }
}