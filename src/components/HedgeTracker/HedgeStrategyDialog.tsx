'use client'

import { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { DialogProps } from '@toolpad/core/useDialogs'
import { getOptionsPricing } from '@/lib/mzDataService'
import { OptionsPricingDataResponse } from '@/lib/types'
import { generateHedgeSuggestions, HedgeStrategy } from '@/lib/hedgeAlgorithm'
import { useSavedStrategies, SavedStrategy } from '@/lib/useSavedStrategies'
import { HedgeStrategyBuilder, CustomStrategy } from './HedgeStrategyBuilder'

export type HedgeStrategyDialogPayload = {
    symbol: string;
    hedgeRatio: number;
    initialStrategy?: SavedStrategy;
}

const strategyTypeLabel: Record<string, string> = {
    PUT_DEBIT_SPREAD: 'Put Spread',
    CALL_CREDIT_SPREAD: 'Call Spread',
    DEEP_ITM_CALL: 'Deep ITM',
}

const strategyTypeColor: Record<string, 'primary' | 'secondary' | 'info'> = {
    PUT_DEBIT_SPREAD: 'primary',
    CALL_CREDIT_SPREAD: 'secondary',
    DEEP_ITM_CALL: 'info',
}

export function HedgeStrategyDialog({
    payload,
    open,
    onClose,
}: DialogProps<HedgeStrategyDialogPayload, SavedStrategy | undefined>) {
    const { symbol, hedgeRatio, initialStrategy } = payload
    const [tab, setTab] = useState(initialStrategy ? 1 : 0)
    const [optionsChain, setOptionsChain] = useState<OptionsPricingDataResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [suggestions, setSuggestions] = useState<HedgeStrategy[]>([])
    const { saveStrategy, isSaved } = useSavedStrategies(symbol)

    useEffect(() => {
        if (!open) return
        setLoading(true)
        setError(null)
        setOptionsChain(null)
        setSuggestions([])

        getOptionsPricing(symbol)
            .then(data => {
                setOptionsChain(data)
                const spotPrice = data.spotPrice
                const positionValue = spotPrice * 100
                const generated = generateHedgeSuggestions(data, spotPrice, positionValue, hedgeRatio)
                setSuggestions(generated)
            })
            .catch(err => setError(err.message || 'Failed to load options data'))
            .finally(() => setLoading(false))
    }, [open, symbol, hedgeRatio])

    useEffect(() => {
        if (initialStrategy) setTab(1)
    }, [initialStrategy])

    const handleSaveSuggested = (strategy: HedgeStrategy) => {
        const saved: SavedStrategy = {
            id: strategy.id,
            symbol,
            name: strategy.label,
            source: 'suggested',
            strategyType: strategy.type,
            legs: strategy.legs.map(leg => ({
                ...leg,
                quantity: leg.quantity || 1,
            })),
        }
        saveStrategy(saved)
        onClose(saved)
    }

    const handleSaveCustom = (strategy: CustomStrategy) => {
        const saved: SavedStrategy = {
            id: strategy.id,
            symbol,
            name: strategy.name,
            source: 'custom',
            strategyType: strategy.strategyType,
            legs: strategy.legs.map(leg => ({
                type: leg.type,
                mode: leg.mode,
                strike: leg.strike,
                expiration: leg.expiration,
                quantity: leg.quantity,
                bid: 0,
                ask: 0,
                contractSymbol: '',
            })),
        }
        saveStrategy(saved)
        onClose(saved)
    }

    return (
        <Dialog open={open} maxWidth="md" fullWidth onClose={() => onClose(undefined)}>
            <DialogTitle>Hedge Strategies — {symbol}</DialogTitle>
            <DialogContent dividers>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Typography variant="body2" color="error.main" sx={{ py: 2 }}>
                        {error}
                    </Typography>
                )}

                {!loading && !error && (
                    <>
                        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                            <Tab label="Suggested" />
                            <Tab label="Custom Builder" />
                        </Tabs>

                        {tab === 0 && (
                            <Stack spacing={1}>
                                {suggestions.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                        No suggestions available for this position.
                                    </Typography>
                                )}
                                {suggestions.map(strategy => {
                                    const saved = isSaved(strategy.id)
                                    return (
                                        <Stack
                                            key={strategy.id}
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    label={strategyTypeLabel[strategy.type]}
                                                    size="small"
                                                    color={strategyTypeColor[strategy.type]}
                                                    variant="outlined"
                                                />
                                                <Typography variant="body2" fontWeight="medium">
                                                    {strategy.label}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                {strategy.netDebit > 0 && (
                                                    <Typography variant="body2" color="error.main">
                                                        {'Cost: $'}{strategy.netDebit.toFixed(2)}
                                                    </Typography>
                                                )}
                                                {strategy.netCredit > 0 && (
                                                    <Typography variant="body2" color="success.main">
                                                        {'Credit: $'}{strategy.netCredit.toFixed(2)}
                                                    </Typography>
                                                )}
                                                <Button
                                                    size="small"
                                                    startIcon={<SaveIcon />}
                                                    variant={saved ? 'outlined' : 'contained'}
                                                    disabled={saved}
                                                    onClick={() => handleSaveSuggested(strategy)}
                                                >
                                                    {saved ? 'Saved' : 'Save'}
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    )
                                })}
                            </Stack>
                        )}

                        {tab === 1 && optionsChain && (
                            <HedgeStrategyBuilder
                                symbol={symbol}
                                optionsChain={optionsChain}
                                onSave={handleSaveCustom}
                                initialStrategy={initialStrategy}
                            />
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(undefined)}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}
