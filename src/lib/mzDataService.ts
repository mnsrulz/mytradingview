import ky from "ky";

export type CachedReleasesType = {
    name: string
}

export const getCachedSummaryData = ky(`https://mztrading-data.deno.dev/summary`).json<{ symbol: string, dt: string }[]>

export const getCachedReleaseData = ky(`https://mztrading-data.deno.dev/releases`).json<CachedReleasesType[]>
