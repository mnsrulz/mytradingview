'use client'

import { useState } from 'react'
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { OptionsPricingDataResponse } from '@/lib/types'
import { HedgeStrategyLeg, StrategyLeg } from './HedgeStrategyLeg'

type StrategyType = 'PUT_SPREAD' | 'CALL_SPREAD' | 'COLLAR' | 'SINGLE_LEG' | 'TWO_LEG' | 'THREE_LEG' | 'FOUR_LEG'

export type CustomStrategy = {
    id: string;
    name: string;
    strategyType: StrategyType;
    legs: StrategyLeg[];
    symbol: string;
}

type HedgeStrategyBuilderProps = {
    symbol: string;
    optionsChain: OptionsPricingDataResponse;
    onSave: (strategy: CustomStrategy) => void;
    initialStrategy?: CustomStrategy;
}

const STRATEGY_TYPES: { value: StrategyType; label: string }[] = [
    { value: 'PUT_SPREAD', label: 'Put Spread' },
    { value: 'CALL_SPREAD', label: 'Call Spread' },
    { value: 'COLLAR', label: 'Collar' },
    { value: 'SINGLE_LEG', label: 'Single Leg' },
    { value: 'TWO_LEG', label: 'Two Leg' },
    { value: 'THREE_LEG', label: 'Three Leg' },
    { value: 'FOUR_LEG', label: 'Four Leg' },
]

const inferStrategyType = (legs: StrategyLeg[]): StrategyType => {
    if (legs.length === 1) return 'SINGLE_LEG'
    const types = legs.map(l => l.type)
    const hasCall = types.includes('CALL')
    const hasPut = types.includes('PUT')
    if (legs.length === 2 && hasCall && hasPut) return 'COLLAR'
    if (legs.length === 2 && types.every(t => t === 'PUT')) return 'PUT_SPREAD'
    if (legs.length === 2 && types.every(t => t === 'CALL')) return 'CALL_SPREAD'
    if (legs.length === 3) return 'THREE_LEG'
    if (legs.length === 4) return 'FOUR_LEG'
    return 'TWO_LEG'
}

const buildDefaultLegs = (strategyType: StrategyType, optionsChain: OptionsPricingDataResponse, symbol: string): StrategyLeg[] => {
    const expirations = Object.keys(optionsChain.options).sort()
    const defaultExpiry = expirations[0] || dayjs().add(30, 'day').format('YYYY-MM-DD')
    const expData = optionsChain.options[defaultExpiry]
    const puts = expData ? Object.keys(expData.p).map(Number) : []
    const calls = expData ? Object.keys(expData.c).map(Number) : []
    const strikes = [...new Set([...puts, ...calls])].sort((a, b) => a - b)
    const midStrike = strikes[Math.floor(strikes.length / 2)] || 100

    switch (strategyType) {
        case 'PUT_SPREAD':
            return [
                { id: nanoid(), type: 'PUT', mode: 'BUY', strike: midStrike, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'PUT', mode: 'SELL', strike: midStrike - 5, expiration: defaultExpiry, quantity: 1 },
            ]
        case 'CALL_SPREAD':
            return [
                { id: nanoid(), type: 'CALL', mode: 'SELL', strike: midStrike, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'CALL', mode: 'BUY', strike: midStrike + 5, expiration: defaultExpiry, quantity: 1 },
            ]
        case 'COLLAR':
            return [
                { id: nanoid(), type: 'CALL', mode: 'SELL', strike: midStrike + 5, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'PUT', mode: 'BUY', strike: midStrike - 5, expiration: defaultExpiry, quantity: 1 },
            ]
        case 'SINGLE_LEG':
            return [
                { id: nanoid(), type: 'CALL', mode: 'SELL', strike: midStrike, expiration: defaultExpiry, quantity: 1 },
            ]
        case 'TWO_LEG':
            return [
                { id: nanoid(), type: 'CALL', mode: 'SELL', strike: midStrike, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'PUT', mode: 'BUY', strike: midStrike - 5, expiration: defaultExpiry, quantity: 1 },
            ]
        case 'THREE_LEG':
            return [
                { id: nanoid(), type: 'CALL', mode: 'SELL', strike: midStrike, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'CALL', mode: 'BUY', strike: midStrike + 5, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'PUT', mode: 'BUY', strike: midStrike - 5, expiration: defaultExpiry, quantity: 1 },
            ]
        case 'FOUR_LEG':
            return [
                { id: nanoid(), type: 'CALL', mode: 'SELL', strike: midStrike, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'CALL', mode: 'BUY', strike: midStrike + 5, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'PUT', mode: 'SELL', strike: midStrike - 5, expiration: defaultExpiry, quantity: 1 },
                { id: nanoid(), type: 'PUT', mode: 'BUY', strike: midStrike - 10, expiration: defaultExpiry, quantity: 1 },
            ]
        default:
            return [
                { id: nanoid(), type: 'CALL', mode: 'SELL', strike: midStrike, expiration: defaultExpiry, quantity: 1 },
            ]
    }
}

const buildStrategyName = (strategyType: StrategyType, legs: StrategyLeg[]): string => {
    const label = STRATEGY_TYPES.find(s => s.value === strategyType)?.label || strategyType
    const strikes = legs.map(l => l.strike).sort((a, b) => a - b)
    const expiry = legs[0] ? dayjs(legs[0].expiration).format('MM/DD') : ''
    return `${label} ${expiry} ${strikes.join('/')}`
}

export const HedgeStrategyBuilder = ({
    symbol,
    optionsChain,
    onSave,
    initialStrategy,
}: HedgeStrategyBuilderProps) => {
    const [strategyType, setStrategyType] = useState<StrategyType>(
        initialStrategy?.legs ? inferStrategyType(initialStrategy.legs) : 'PUT_SPREAD'
    )
    const [legs, setLegs] = useState<StrategyLeg[]>(() => {
        if (initialStrategy?.legs) {
            return initialStrategy.legs.map(l => ({ ...l }))
        }
        return buildDefaultLegs('PUT_SPREAD', optionsChain, symbol)
    })

    const expirations = Object.keys(optionsChain.options).sort()

    const getStrikesForExpiry = (expiry: string): number[] => {
        const expData = optionsChain.options[expiry]
        if (!expData) return []
        const puts = Object.keys(expData.p).map(Number)
        const calls = Object.keys(expData.c).map(Number)
        return [...new Set([...puts, ...calls])].sort((a, b) => a - b)
    }

    const handleTypeChange = (type: StrategyType) => {
        setStrategyType(type)
        setLegs(buildDefaultLegs(type, optionsChain, symbol))
    }

    const handleLegChange = (updatedLeg: StrategyLeg) => {
        setLegs(prev => prev.map(l => l.id === updatedLeg.id ? updatedLeg : l))
    }

    const handleSave = () => {
        const strategy: CustomStrategy = {
            id: initialStrategy?.id || nanoid(),
            name: buildStrategyName(strategyType, legs),
            strategyType,
            legs,
            symbol,
        }
        onSave(strategy)
    }

    return (
        <Stack spacing={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Strategy Type</InputLabel>
                <Select
                    value={strategyType}
                    label="Strategy Type"
                    onChange={(e) => handleTypeChange(e.target.value as StrategyType)}
                >
                    {STRATEGY_TYPES.map(st => (
                        <MenuItem key={st.value} value={st.value}>{st.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Typography variant="subtitle2" color="text.secondary">
                Legs ({legs.length})
            </Typography>

            {legs.map((leg, index) => {
                const strikes = getStrikesForExpiry(leg.expiration)
                const lockTypeSide = ['PUT_SPREAD', 'CALL_SPREAD', 'COLLAR'].includes(strategyType)
                return (
                    <Box key={leg.id}>
                        <Typography variant="caption" color="text.secondary">
                            Leg {index + 1}
                        </Typography>
                        <HedgeStrategyLeg
                            leg={leg}
                            availableExpirations={expirations}
                            availableStrikes={strikes.length > 0 ? strikes : [leg.strike]}
                            onChange={handleLegChange}
                            lockTypeSide={lockTypeSide}
                        />
                    </Box>
                )
            })}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={handleSave} variant="contained">
                    {initialStrategy ? 'Update Strategy' : 'Save Strategy'}
                </Button>
            </Stack>
        </Stack>
    )
}
