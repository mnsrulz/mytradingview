'use client'

import { useState } from 'react'
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'
import { useDialogs } from '@toolpad/core/useDialogs'
import { AggregatedPosition } from '@/lib/usePortfolio'
import { useSavedStrategies, SavedStrategy } from '@/lib/useSavedStrategies'
import { SavedStrategyRow } from './SavedStrategyRow'
import { HedgeStrategyDialog } from './HedgeStrategyDialog'
import NumberFlow from '@number-flow/react'

type HedgePositionCardProps = {
    position: AggregatedPosition;
    hedgeRatio: number;
}

export const HedgePositionCard = ({
    position,
    hedgeRatio,
}: HedgePositionCardProps) => {
    const dialogs = useDialogs()
    const { strategies: savedStrategies, saveStrategy, removeStrategy } = useSavedStrategies(position.symbol)
    const [editingStrategy, setEditingStrategy] = useState<SavedStrategy | null>(null)

    const handleHedgeClick = async () => {
        setEditingStrategy(null)
        await dialogs.open(HedgeStrategyDialog, {
            symbol: position.symbol,
            hedgeRatio,
        })
    }

    const handleEditClick = async (strategy: SavedStrategy) => {
        setEditingStrategy(strategy)
        await dialogs.open(HedgeStrategyDialog, {
            symbol: position.symbol,
            hedgeRatio,
            initialStrategy: strategy,
        })
        setEditingStrategy(null)
    }

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">{position.symbol}</Typography>
                        <Chip
                            label={`${position.totalQuantity} shares`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                                Price
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                $<NumberFlow value={position.price} />
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                                Value
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                $<NumberFlow value={position.totalValue} />
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                                Today
                            </Typography>
                            <Typography
                                variant="body1"
                                color={position.change >= 0 ? 'success.main' : 'error.main'}
                            >
                                {Number(position.changePercent).toFixed(2)}%
                            </Typography>
                        </Box>
                        <IconButton
                            color="primary"
                            onClick={handleHedgeClick}
                            title="Hedge strategies"
                        >
                            <ShieldIcon />
                        </IconButton>
                    </Stack>
                </Stack>
                {position.totalCostBasis > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {'Cost basis: $'}{position.weightedAverageCostBasis.toFixed(2)}{' | '}
                        P&L: <span style={{ color: position.totalValueChange >= 0 ? '#2e7d32' : '#d32f2f' }}>
                            {'$'}{position.totalValueChange >= 0 ? '+' : ''}{position.totalValueChange.toFixed(2)}
                        </span>
                    </Typography>
                )}
                {savedStrategies.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {savedStrategies.map(strategy => (
                            <SavedStrategyRow
                                key={strategy.id}
                                strategy={strategy}
                                onRemove={removeStrategy}
                                onEdit={handleEditClick}
                            />
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    )
}
