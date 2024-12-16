import ky from "ky";
import { SearchTickerItem } from "./types";

export type CachedReleasesType = {
    name: string
}

export const getCachedSummaryData = () => ky(`https://mztrading-data.deno.dev/summary`, {
    cache: "no-store"   //no cache for this data
}).json<{ symbol: string, dt: string }[]>()

export const getCachedReleaseData = () => ky(`https://mztrading-data.deno.dev/releases`, {
    cache: "no-store"   //no cache for this data
}).json<CachedReleasesType[]>();

export const getCachedSummaryDatesBySymbol = async (symbol: string) => {
    const response = await ky(`https://mztrading-data.deno.dev/summary`, {
        searchParams: {
            s: symbol
        },
        cache: "no-store"   //no cache for this data
    }).json<{ symbol: string, dt: string }[]>();
    return response.map(j => j.dt);
}

export const getHistoricalSnapshotsBySymbol = (symbol: string) => {
    return ky(`https://mztrading-data.deno.dev/symbols/${symbol}/historical/snapshots`, {
        cache: "no-store"   //no cache for this data
    }).json<{
        items: {
            date: string,
            dex: {
                hdAssetUrl: string,
                sdAssetUrl: string
            },
            gex: {
                hdAssetUrl: string,
                sdAssetUrl: string
            }
        }[]
    }>();
}

export const searchTicker = async (searchTerm: string, signal?: AbortSignal) => {
    const items = await ky('https://mztrading-data.deno.dev/symbols', {     //experimeting to avoid api call usage
        searchParams: {
            q: searchTerm
        },
        signal: signal
    }).json<SearchTickerItem[]>();
    return items;
}