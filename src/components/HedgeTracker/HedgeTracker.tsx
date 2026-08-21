'use client'

import { Box, Stack, Slider, Typography } from '@mui/material'
import { useQueryState, parseAsInteger } from 'nuqs'
import { usePortfolio } from '@/lib/usePortfolio'
import { AggregatedPosition } from '@/lib/usePortfolio'
import { HedgePositionCard } from './HedgePositionCard'
import { HedgeSummary } from './HedgeSummary'

export const HedgeTracker = () => {
    const { aggregatedPositions, isLoading } = usePortfolio()
    const [hedgeRatio, setHedgeRatio] = useQueryState('ratio', parseAsInteger.withDefault(25))

    if (isLoading) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography>Loading portfolio...</Typography>
            </Box>
        )
    }

    if (aggregatedPositions.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">
                    No positions to hedge. Add positions in the Portfolio page first.
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">
                    Portfolio Hedge Tracker
                </Typography>
                <Box sx={{ width: 300 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Hedge Ratio: {hedgeRatio}%
                    </Typography>
                    <Slider
                        value={hedgeRatio}
                        onChange={(_, value) => setHedgeRatio(value as number)}
                        min={25}
                        max={100}
                        step={25}
                        marks
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}%`}
                    />
                </Box>
            </Stack>

            <HedgeSummary positions={aggregatedPositions} hedgeRatio={hedgeRatio} />

            <Stack spacing={0}>
                {aggregatedPositions.map((position) => (
                    <HedgePositionCard
                        key={position.symbol}
                        position={position}
                        hedgeRatio={hedgeRatio}
                    />
                ))}
            </Stack>
        </Box>
    )
}
