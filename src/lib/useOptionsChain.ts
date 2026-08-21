'use client'

import { useEffect, useState } from 'react'
import { getOptionsPricing } from '@/lib/mzDataService'
import { OptionsPricingDataResponse } from '@/lib/types'

export type OptionsChainState = {
    data: OptionsPricingDataResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const useOptionsChain = (symbol: string | undefined) => {
    const [state, setState] = useState<OptionsChainState>({
        data: null,
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        if (!symbol) {
            setState({ data: null, isLoading: false, error: null });
            return;
        }

        let cancelled = false;
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        getOptionsPricing(symbol)
            .then((data) => {
                if (cancelled) return;
                setState({ data, isLoading: false, error: null });
            })
            .catch((err: Error) => {
                if (cancelled) return;
                setState({ data: null, isLoading: false, error: err.message || 'Failed to fetch options chain' });
            });

        return () => { cancelled = true; };
    }, [symbol]);

    return state;
}
