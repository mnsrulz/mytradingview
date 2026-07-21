import ky from "ky";
import { useEffect, useState } from "react";
const MZINGEST_URL = process.env.MZINGEST_URL || 'https://mzingest.netlify.app/api';
const client = ky.create({
    prefixUrl: MZINGEST_URL,
    headers: {
        'Accept': 'application/json'
    },
    cache: 'no-cache',
    retry: {
        limit: 2,
        methods: ['get', 'post', 'put', 'head', 'delete', 'options'],
        retryOnTimeout: true
    }
});

type SocketRequestType = 'expected-move-query' | 'ohlc-query' | 'volatility-query' | 'options-stat-query' | 'dynamic-sql-query';
export const submitQuery = <T>(requestType: SocketRequestType, params: object, signal?: AbortSignal) => {
    const requestId = crypto.randomUUID();
    return client.post(`requests`, {
        signal: signal,
        json: { ...params, requestId, requestType: requestType.toString() }
    }).json<{ hasError: boolean, value: T }>()
}
export const useSubmitRequest = <T>(requestType: SocketRequestType, defaultData: T, params: object) => {
    const [data, setData] = useState<T>(defaultData);
    const [state, setState] = useState({ isLoading: true, hasError: false, error: '' });

    useEffect(() => {
        const ab = new AbortController();
        setState({ isLoading: true, hasError: false, error: '' });
        const requestId = crypto.randomUUID();
        client.post(`requests`, {
            signal: ab.signal,
            json: { ...params, requestId, requestType: requestType.toString() }
        }).json<{ hasError: boolean, value: T }>().then(res => {
            if (res.hasError) {
                setState({ isLoading: false, hasError: true, error: 'Query failed.' });
            } else {
                setData(res.value);
                setState({ isLoading: false, hasError: false, error: '' });
            }
        }).catch((err: Error) => {
            if (err.name === 'AbortError' || ab.signal.aborted) {
                console.log('Fetch successfully aborted, ignoring state update.');
                return;
            }
            console.error(err);
            setState({ isLoading: false, hasError: true, error: err.message || 'Unknown error' });
        });

        return () => ab.abort();
    }, [JSON.stringify(params), requestType]);
    return { data, ...state };
}