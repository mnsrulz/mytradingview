import ky from "ky";
import { MiniOptionContract, SearchTickerItem } from "./types";

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

export const getCachedDataForSymbol = async (symbol: string) => {
    return await client(`beta/symbols/${symbol}/historical/snapshots`).json<{ dt: string }[]>();
}

// export const getCachedDataForSymbolByDate = async (symbol: string, date: string) => {
//     return await client(`beta/symbols/${symbol}/historical/snapshots/${date}`).json<{
//         expiration: string,
//         delta: number,
//         gamma: number
//         strike: number,
//         option_type: 'P' | 'C',
//         open_interest: number,
//         volume: number,
//     }[]>();
// }

// export const getFullOptionChainCboe = async (symbol: string) => {
//     return await client(`beta/symbols/${symbol}/cboeoptionchain`).json<{
//         data: {
//             strike: number,
//             expiration_date: string,
//             open_interest: number,
//             option_type: 'call' | 'put',
//             volume: number,
//             delta: number,
//             gamma: number
//         }[],
//         currentPrice: number
//     }>();
// }
export type ExposureDataResponse = {
    data: {
        call: {
            absDelta: number[],
            openInterest: number[],
            volume: number[]
        },
        put: {
            absDelta: number[],
            openInterest: number[],
            volume: number[]
        },
        netGamma: number[],
        strikes: string[],
        expiration: string,
        dte: number
    }[],
    spotPrice: number
}
export const getHistoricalOptionExposure = async (symbol: string, dt: string) => {
    //https://mztrading-data.deno.dev/beta/symbols/tsm/historical/snapshots/2024-12-28/exposure
    return await client(`beta/symbols/${symbol}/historical/snapshots/${dt}/exposure`).json<ExposureDataResponse>();
}

export const getLiveCboeOptionExposure = async (symbol: string) => {
    return await client(`beta/symbols/${symbol}/exposure`).json<ExposureDataResponse>();
}

