'use client'

import { useMemo } from 'react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { HedgeLeg } from '@/lib/hedgeAlgorithm'

export type SavedStrategy = {
    id: string;
    symbol: string;
    name: string;
    source: 'suggested' | 'custom';
    strategyType: string;
    legs: HedgeLeg[];
}

type SavedStrategiesMap = Record<string, SavedStrategy[]>

const STORAGE_KEY = 'hedge-tracker-saved-strategies'

export const useSavedStrategies = (symbol: string) => {
    const [allStrategies, setAllStrategies] = useLocalStorage<SavedStrategiesMap>(STORAGE_KEY, {})

    const strategies = useMemo(() => allStrategies[symbol] || [], [JSON.stringify(allStrategies), symbol])

    const saveStrategy = (strategy: SavedStrategy) => {
        setAllStrategies(prev => {
            const existing = prev[strategy.symbol] || []
            const existingIndex = existing.findIndex(s => s.id === strategy.id)
            if (existingIndex >= 0) {
                const updated = [...existing]
                updated[existingIndex] = strategy
                return { ...prev, [strategy.symbol]: updated }
            }
            return {
                ...prev,
                [strategy.symbol]: [...existing, strategy],
            }
        })
    }

    const removeStrategy = (strategyId: string) => {
        setAllStrategies(prev => ({
            ...prev,
            [symbol]: (prev[symbol] || []).filter(s => s.id !== strategyId),
        }))
    }

    const isSaved = (strategyId: string) => {
        return strategies.some(s => s.id === strategyId)
    }

    return { strategies, saveStrategy, removeStrategy, isSaved }
}
