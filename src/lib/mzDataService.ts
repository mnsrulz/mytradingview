import ky from "ky";
import { ExposureDataRequest, OptionGreeksSummaryByDateResponse, OptionGreeksSummaryBySymbolResponse, OptionsPricingDataResponse, SearchTickerItem, ExposureSnapshotByDateResponse, ExposureDataResponse, ExposureSnapshotBySymbolResponse, OIAnomalyReportDataResponse, OIReportDataResponse, OIExpirationsDataResponse, OptionGreeksExposureWallsByDateResponse, } from "./types";

export type CachedReleasesType = {
    name: string
}

const client = ky.create({
    prefixUrl: 'https://mztrading-data.deno.dev',
    headers: {
        'Accept': 'application/json'
    },
    cache: 'no-cache'
});

export const getHistoricalSnapshotsBySymbol = (symbol: string) => {
    return client(`api/options/${symbol}/exposures/snapshots`).json<ExposureSnapshotBySymbolResponse[]>();
}

export const searchTicker = async (searchTerm: string, signal?: AbortSignal) => {
    return await client('api/symbols', { searchParams: { q: searchTerm }, signal: signal }).json<SearchTickerItem[]>();
}

export const getCachedDataForSymbol = async (symbol: string) => {
    return await client(`api/options/${symbol}/exposure/historical-dates`).json<{ dt: string }[]>();
}

export const getAvailableExposureDates = async () => {
    return await client(`api/options/exposures/dates`).json<{ dt: string }[]>();
}

export const getAvailableExposureSnapshotDates = async () => {
    return await client(`api/options/exposures/snapshot-dates`).json<{ dt: string }[]>();
}

export const getExposureSnapshotByDate = async (dt: string) => {
    return await client(`api/options/exposures/snapshots?dt=${dt}`).json<ExposureSnapshotByDateResponse[]>();
}

export const getHistoricalOptionExposure = async (symbol: string, dt: string) => {
    return await client(`api/options/${symbol}/exposure/historical?dt=${dt}`).json<ExposureDataResponse>();
}

export const getLiveCboeOptionExposure = async (symbol: string) => {
    return await client(`api/options/${symbol}/exposure`).json<ExposureDataResponse>();
}

export const calculateExposureData = async (exposureDataRequest: ExposureDataRequest) => {
    return await client.post(`api/options/exposure/calculate`, { json: exposureDataRequest }).json<ExposureDataResponse>();
}

export const getEmaDataForExpsoure = async (symbol: string) => {
    return await client(`api/stocks/${symbol}/indicators?q=ema21d,ema9d`).json<{ ema9d: number, ema21d: number }>();
}

export const getHistoricalGreeksSummaryByDate = async (dt: string, dte: number) => {
    return await client(`api/options/report/greeks?dt=${dt}&dte=${dte}`).json<OptionGreeksSummaryByDateResponse[]>();
}

export const getHistoricalExposureWallsByDate = async (dt: string, dte: number, symbol?: string) => {
    const params: Record<string, string | number> = {};
    if (dt) params.dt = dt;
    if (dte) params.dte = dte;
    if (symbol) params.symbol = symbol;

    return await client(`api/options/report/exposure-walls?dt=${dt}&dte=${dte}`, {
        searchParams: params
    }).json<OptionGreeksExposureWallsByDateResponse[]>();
}

export const getOIAnomalyReport = async (params: { dt?: string; symbols?: string; dteFrom?: number; dteTo?: number; }) => {
    const searchParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined).map(([k, v]) => [k, String(v)])
    );

    return await client(`api/options/report/oi-anomaly`, {
        searchParams,
    }).json<OIAnomalyReportDataResponse[]>();
};

export const getOptionsPricing = async (symbol: string) => {
    return await client(`api/options/${symbol}/pricing`).json<OptionsPricingDataResponse>();
}

export const getHistoricalGreeksSummaryBySymbol = async (symbol: string) => {
    return await client(`api/options/${symbol}/report/greeks`).json<OptionGreeksSummaryBySymbolResponse[]>();
}

export const getHistoricalOISummaryBySymbol = async (symbol: string, expirationDates: string[]) => {
    return await client(`api/options/${symbol}/report/oi`, {
        searchParams: {
            expirationDates: expirationDates.join(',')
        }
    }).json<OIReportDataResponse[]>();
}

export const getHistoricalExpirationsBySymbol = async (symbol: string) => {
    return await client(`api/options/${symbol}/report/greeks/expirations`).json<OIExpirationsDataResponse[]>();
}

export const searchOIAnomaly = async (data: any, abortSignal: AbortSignal | null) => {
    console.log(`searchOIAnomaly...`)
    return await client.post(`api/search/oi-anomaly`, {
        json: data,
        signal: abortSignal
    }).json();
}

export const searchOIAnomalyFacet = async (data: any, abortSignal: AbortSignal | null) => {
    console.log(`searchOIAnomalyFacet...`)
    return await client.post(`api/search/oi-anomaly/facet`, {
        json: data,
        signal: abortSignal
    }).json();
}