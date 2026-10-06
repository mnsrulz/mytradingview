'use client';
import { useEffect, useMemo, useState } from 'react';
import { LivePageTrackingView } from './types';
import { submitQuery, useSubmitRequest } from './mzIngestService';
// let socket: Socket;

if (typeof window === 'undefined') {
    // SSR env, no need to connect socket.
} else {

}

export const useTrackPage = (pathName: string) => {
    useEffect(() => {
        // const timer = setInterval(() => {
        //     socket.volatile.emit('track-page', {
        //         pageUrl: pathName,
        //     });
        // }, TrackPageInterval);

        // return () => {
        //     clearInterval(timer);
        //     socket.volatile.emit('untrack-page', {
        //         pageUrl: pathName,
        //     });
        // }
    }, [pathName]);
}

export const useLivePageTrackingViews = () => {
    const [views, setViews] = useState<LivePageTrackingView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // socket.timeout(3000).emitWithAck('list-active-page-tracking').then(handleDataCb);
        // const timer = setInterval(() => {
        //     socket.timeout(3000).emitWithAck('list-active-page-tracking').then(handleDataCb);
        // }, 3000);
        // return () => { clearInterval(timer); }
    }, []);
    return { views, isLoading };
}

// export const subscribeStockPriceBatchRequest = (tickers: SearchTickerItem[]) => {
//     socket.volatile.emit('stock-price-subscribe-batch-request', { tickers, frequency: WatchlistUpdateFrequency });
// }

export type VolatilityResponse = {
    dt: string[];
    cv: number[];
    pv: number[];
    cp: number[];
    pp: number[];
    cs: number[];
    ps: number[];
    iv30: number[];
    iv_percentile: number[];
    close: number[];
};

export type ExpectedMoveResponse = {
    dt: string[];
    last_close: number[];
    straddle_price: number[];
};

export type OptionsStatsResponse = {
    dt: string[];
    cd: number[];
    pd: number[];
    cp: number[];
    pp: number[];
    co: number[];
    po: number[];
    options_count: number[];
    close: number[];
};
// const dummyVolatilityResponse: VolatilityResponse = {
//     dt: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
//     cv: [0.2, 0.25, 0.22, 0.1, 0.91],
//     pv: [0.18, 0.23, 0.21, 0.15, 0.89]
// }
const defaultVoltility: VolatilityResponse = { dt: [], cv: [], pv: [], cp: [], pp: [], cs: [], ps: [], iv30: [], close: [], iv_percentile: [] };
const defaultOptionsStats: OptionsStatsResponse = { dt: [], cd: [], pd: [], cp: [], pp: [], co: [], po: [], close: [], options_count: [] };
export const useOptionHistoricalVolatility = (symbol: string, lookbackDays: number, delta: number, strike: number, expiration: string, mode: 'delta' | 'strike' | 'atm', dte: number, expiryMode: 'fixed' | 'rolling') => {
    const { data, isLoading, hasError, error } = useSubmitRequest('volatility-query', defaultVoltility, {
        symbol,
        lookbackDays,
        delta: mode == 'delta' ? delta : null,
        expiration: expiryMode == 'fixed' ? expiration : undefined,
        dte: expiryMode == 'rolling' ? dte : undefined,
        mode,
        expiryMode,
        strike: mode == 'strike' ? strike : null,
    })
    const mappedData = useMemo(() => {
        const straddle = (data.cp || []).map((v, x) => (data.pp?.[x] ?? 0) + v);
        return { ...data, straddle };
    }, [data]);

    return { volatility: mappedData, isLoading, hasError, error };
}

const defaultExpectedMove = { dt: [] as string[], last_close: [] as number[], straddle_price: [] as number[], expiry: [] as string[] };
const defaultOhlcData = { dt: [] as string[], open: [] as number[], high: [] as number[], low: [] as number[], close: [] as number[], iv30: [] as number[] };
export const useExpectedMove = (symbol: string, lookbackDays: number, expiryMode: 'weekly' | 'monthly') => {
    const { data, isLoading, hasError, error } = useSubmitRequest('expected-move-query', defaultExpectedMove, {
        symbol, lookbackDays, expiryMode
    })
    const mappedData = useMemo(() => data.dt.map((d, ix) => ({
        dt: d,
        last_close: data.last_close?.[ix] ?? 0,
        straddle_price: data.straddle_price?.[ix] ?? 0,
        expiry: data.expiry?.[ix] ?? ''
    })), [data]);
    return { data: mappedData, isLoading, hasError, error };
}

export const useOhlc = (symbol: string, lookbackDays: number) => {
    const { data, isLoading, hasError, error } = useSubmitRequest('ohlc-query', defaultOhlcData, {
        symbol, lookbackDays
    })
    const mappedData = useMemo(() => data.dt.map((d, ix) => ({
        dt: d,
        open: data.open?.[ix] ?? 0,
        high: data.high?.[ix] ?? 0,
        low: data.low?.[ix] ?? 0,
        close: data.close?.[ix] ?? 0,
        iv30: data.iv30?.[ix] ?? 0
    })), [data]);
    return { data: mappedData, isLoading, hasError, error };
}

export const useOptionsStats = (symbol: string, lookbackDays: number) => {
    const { data, isLoading, hasError, error } = useSubmitRequest('options-stat-query', defaultOptionsStats, {
        symbol,
        lookbackDays
    })
    return { stats: data, isLoading, hasError, error };
}

type DDType = Record<string, any[]>

const toRowObjects = (value: DDType): Record<string, any>[] => {
    const cols = Object.keys(value);
    if (!cols.length) return [];

    const rowCount = value[cols[0]].length;
    return Array.from({ length: rowCount }, (_, i) => {
        const rowObj: Record<string, any> = {};
        cols.forEach(col => {
            rowObj[col] = value[col][i];
        });
        return rowObj;
    });
}

export const runDynamicQuery = async (symbol: string, sql: string, signal?: AbortSignal) => {
    console.log(`$${symbol} | Running dynamic query for 
    -----------BEGIN------
    ${sql}
    -----------END--------
    `);

    const data = await submitQuery<DDType>('dynamic-sql-query', {
        symbol,
        sql
    }, signal);

    if (data.hasError || data.value === undefined || data.value === null) {
        throw new Error(`Error executing query for ${symbol}. Please try again later or choose a different symbol. If problem persist, report via contact us page.`);
    }
    return toRowObjects(data.value);
}

export const runBullRunSignalQuery = async (symbol: string, lookbackDays: number, signal?: AbortSignal) => {
    const data = await submitQuery<DDType>('bull-run-signal-query', {
        symbol,
        lookbackDays
    }, signal);

    if (data.hasError || data.value === undefined || data.value === null) {
        throw new Error(`Error executing query for ${symbol}. Please try again later or choose a different symbol. If problem persist, report via contact us page.`);
    }
    return toRowObjects(data.value);
}