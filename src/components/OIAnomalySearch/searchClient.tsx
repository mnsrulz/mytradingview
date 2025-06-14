'use client';
import { searchOIAnomaly, searchOIAnomalyFacet } from '@/lib/mzDataService';

export const searchClient = {
    async search<T>(searchMethodParams: any): Promise<any> {
        const result = await searchOIAnomaly(searchMethodParams);
        return result;
    },
    searchForFacetValues: async function (searchForFacetValuesMethodParams: any): Promise<any> {
        const result = await searchOIAnomalyFacet(searchForFacetValuesMethodParams[0]);
        return result;
    }
};
