'use client'

import { useState } from 'react'
import { Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { SavedStrategy } from '@/lib/useSavedStrategies'
import { HedgeStrategyChart } from './HedgeStrategyChart'

type SavedStrategyRowProps = {
    strategy: SavedStrategy;
    onRemove: (strategyId: string) => void;
    onEdit: (strategy: SavedStrategy) => void;
}

const strategyTypeColor: Record<string, 'primary' | 'secondary' | 'warning' | 'info'> = {
    PUT_DEBIT_SPREAD: 'primary',
    CALL_CREDIT_SPREAD: 'secondary',
    DEEP_ITM_CALL: 'info',
    PUT_SPREAD: 'primary',
    CALL_SPREAD: 'secondary',
    COLLAR: 'warning',
    SINGLE_LEG: 'info',
    TWO_LEG: 'info',
    THREE_LEG: 'info',
    FOUR_LEG: 'info',
}

const strategyTypeLabel: Record<string, string> = {
    PUT_DEBIT_SPREAD: 'Put Spread',
    CALL_CREDIT_SPREAD: 'Call Spread',
    DEEP_ITM_CALL: 'Deep ITM',
    PUT_SPREAD: 'Put Spread',
    CALL_SPREAD: 'Call Spread',
    COLLAR: 'Collar',
    SINGLE_LEG: 'Single',
    TWO_LEG: '2-Leg',
    THREE_LEG: '3-Leg',
    FOUR_LEG: '4-Leg',
}

export const SavedStrategyRow = ({ strategy, onRemove, onEdit }: SavedStrategyRowProps) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={strategyTypeLabel[strategy.strategyType] || strategy.strategyType}
                            size="small"
                            color={strategyTypeColor[strategy.strategyType] || 'default'}
                            variant="outlined"
                        />
                        <Typography variant="body2" fontWeight="medium">
                            {strategy.name}
                        </Typography>
                        {strategy.source === 'custom' && (
                            <Chip label="Custom" size="small" variant="outlined" color="info" />
                        )}
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            {strategy.legs.length} leg{strategy.legs.length !== 1 ? 's' : ''}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit(strategy)
                            }}
                        >
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemove(strategy.id)
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </Paper>
            {expanded && (
                <HedgeStrategyChart
                    legs={strategy.legs}
                    symbol={strategy.symbol}
                />
            )}
        </Box>
    )
}
