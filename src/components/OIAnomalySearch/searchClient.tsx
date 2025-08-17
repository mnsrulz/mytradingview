'use client';
import { searchOIAnomaly, searchOIAnomalyFacet } from '@/lib/mzDataService';
let abortController: AbortController | null = null;
function handleAbortController() {
    if (abortController) {
        abortController.abort(); // Cancel previous request
    }
    abortController = new AbortController();
}
export const searchClient = {
    async search<T>(searchMethodParams: any): Promise<any> {
        handleAbortController();
        const result = await searchOIAnomaly(searchMethodParams, abortController?.signal || null);
        return result;
    },
    searchForFacetValues: async function (searchForFacetValuesMethodParams: any): Promise<any> {
        handleAbortController();
        const result = await searchOIAnomalyFacet(searchForFacetValuesMethodParams[0], abortController?.signal || null);
        return result;
    }
};
