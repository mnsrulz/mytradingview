'use client';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { PutCallType } from './types';
import { getOptionHistoricalOhlc } from './mzDataService';

export type OptionPriceHistoryParams = {
    symbol: string;
    expiration: string;
    strike: number;
    putCallType: PutCallType;
};

export type OptionPriceHistoryResponse = {
    dt: string[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
};

export const buildOptionContractId = (params: OptionPriceHistoryParams): string => {
    const root = params.symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    const yymmdd = dayjs(params.expiration).format('YYMMDD');
    const optionType = params.putCallType === PutCallType.PUT ? 'P' : 'C';
    const strike = String(Math.round(params.strike * 1000)).padStart(8, '0');
    return `${root}${yymmdd}${optionType}${strike}`;
};

export const fetchOptionPriceHistory = async (params: OptionPriceHistoryParams, lookbackDays = 1000): Promise<OptionPriceHistoryResponse> => {
    const rows = await getOptionHistoricalOhlc(buildOptionContractId(params), lookbackDays);
    return {
        dt: rows.map(d => d.dt),
        open: rows.map(d => d.open),
        high: rows.map(d => d.high),
        low: rows.map(d => d.low),
        close: rows.map(d => d.close),
        volume: rows.map(d => d.volume),
    };
};

export type PriceHistoryPeriod = 'YTD' | '6M' | '1Y' | 'ALL';

export const filterOptionPriceHistory = (data: OptionPriceHistoryResponse, period: PriceHistoryPeriod): OptionPriceHistoryResponse => {
    if (period == 'ALL' || data.dt.length == 0) return data;
    const startDate = period == 'YTD'
        ? dayjs().startOf('year')
        : dayjs().subtract(period == '6M' ? 6 : 12, 'month');
    const cutoff = startDate.format('YYYY-MM-DD');
    const keepIndexes = data.dt.reduce((acc: number[], d, ix) => {
        if (d >= cutoff) acc.push(ix);
        return acc;
    }, []);
    return {
        dt: keepIndexes.map(ix => data.dt[ix]),
        open: keepIndexes.map(ix => data.open[ix]),
        high: keepIndexes.map(ix => data.high[ix]),
        low: keepIndexes.map(ix => data.low[ix]),
        close: keepIndexes.map(ix => data.close[ix]),
        volume: keepIndexes.map(ix => data.volume[ix]),
    };
};

const defaultResponse: OptionPriceHistoryResponse = { dt: [], open: [], high: [], low: [], close: [], volume: [] };

export const useOptionPriceHistory = (params: OptionPriceHistoryParams | undefined) => {
    const [data, setData] = useState<OptionPriceHistoryResponse>(defaultResponse);
    const [state, setState] = useState({ isLoading: true, hasError: false, error: '' });

    const paramKey = useMemo(() => params ? JSON.stringify(params) : '', [params]);

    useEffect(() => {
        if (!params) {
            setData(defaultResponse);
            setState({ isLoading: false, hasError: false, error: '' });
            return;
        }
        let cancelled = false;
        setState({ isLoading: true, hasError: false, error: '' });
        fetchOptionPriceHistory(params).then((res) => {
            if (cancelled) return;
            setData(res);
            setState({ isLoading: false, hasError: false, error: '' });
        }).catch((err: Error) => {
            if (cancelled) return;
            setData(defaultResponse);
            setState({ isLoading: false, hasError: true, error: err.message || 'Unknown error' });
        });
        return () => { cancelled = true; };
    }, [paramKey, params]);

    return { data, ...state };
};