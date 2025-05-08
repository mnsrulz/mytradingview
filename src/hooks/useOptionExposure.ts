import { useState, useRef, useEffect } from 'react';
import { getHistoricalOptionExposure, getLiveCboeOptionExposure } from '../lib/mzDataService';
import { DexGexType, DataModeType, ExposureDataResponse, ExposureDataType, ExposureCalculationWorkerRequest } from '../lib/types';
import ky from 'ky';

const getLiveTradierOptionExposure = async (symbol: string) => {
    return await ky(`/api/symbols/${symbol}/options/exposure`).json<ExposureDataResponse>();
}

const getLiveExposure = (symbol: string, provider: 'CBOE' | 'TRADIER') => {
    return provider == 'CBOE' ? getLiveCboeOptionExposure(symbol) : getLiveTradierOptionExposure(symbol)
}

export const useOptionExposure = (symbol: string, dte: number, selectedExpirations: string[], strikeCount: number, exposureType: DexGexType, dataMode: DataModeType, dt: string) => {
    const [rawExposureResponse, setRawExposureResponse] = useState<ExposureDataResponse>({ data: [], spotPrice: 0 });
    // const [exposureData, setExposureData] = useState<ExposureDataType>();
    const [isLoading, setIsLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [cacheStore, setCache] = useState<Record<string, ExposureDataResponse>>({});
    const expirationData = rawExposureResponse?.data.map(({ dte, expiration }) => ({ dte, expiration })) || [];
    const [exposureData, setExposureData] = useState<ExposureDataType>();

    const workerRef = useRef<Worker>(null);

    // const [emaData, setEmaData] = useState<{ ema9d: number, ema21d: number }>();
    // useEffect(() => {
    //     if (emaData) return;
    //     getEmaDataForExpsoure(symbol).then(setEmaData);
    // }, [symbol]);
    useEffect(() => {
        setHasError(false);
        const cacheKey = dataMode == DataModeType.HISTORICAL ? `${symbol}-${dt}` : `${symbol}-${dataMode}`;
        if (cacheStore[cacheKey]) {
            setRawExposureResponse(cacheStore[cacheKey]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const exposureResponse = dataMode == DataModeType.HISTORICAL ? getHistoricalOptionExposure(symbol, dt) : getLiveExposure(symbol, dataMode);
        exposureResponse.then(data => {
            setCache((prev) => { prev[cacheKey] = data; return prev; });
            setRawExposureResponse(data);
            setHasData(true);
        }).catch(() => {
            setHasError(true);
        }).finally(() => setIsLoading(false));
    }, [symbol, dt, dataMode]);

    useEffect(() => {
        console.log(`posting the message to worker`);
        workerRef.current = new Worker(new URL("../workers/ew.ts", import.meta.url));
        workerRef.current.onmessage = (event: MessageEvent<ExposureDataType>) => setExposureData(event.data);
        workerRef.current?.postMessage({
            exposureDataResponse: rawExposureResponse, dte, strikeCount, selectedExpirations, exposureType
        } as ExposureCalculationWorkerRequest);
        return () => {
            console.log(`terminating the worker...`);
            workerRef.current?.terminate();
        };
    }, [rawExposureResponse, dte, selectedExpirations, strikeCount, exposureType]);

    return {
        exposureData, isLoading, hasError, expirationData, hasData
        // , emaData
    };
};
