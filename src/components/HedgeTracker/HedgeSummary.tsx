'use client'

import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { AggregatedPosition } from '@/lib/usePortfolio'

type HedgeSummaryProps = {
    positions: AggregatedPosition[];
    hedgeRatio: number;
}

export const HedgeSummary = ({ positions, hedgeRatio }: HedgeSummaryProps) => {
    const totalValue = positions.reduce((sum, p) => sum + p.totalValue, 0)
    const totalHedgedValue = positions.reduce((sum, p) => sum + (p.totalValue * (hedgeRatio / 100)), 0)
    const hedgedPercent = totalValue > 0 ? (totalHedgedValue / totalValue) * 100 : 0

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Portfolio Hedge Summary
                </Typography>
                <Stack direction="row" spacing={4}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Portfolio Value
                        </Typography>
                        <Typography variant="h6" fontWeight="medium">
                            {'$'}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Hedged Value ({hedgeRatio}%)
                        </Typography>
                        <Typography variant="h6" fontWeight="medium" color="primary.main">
                            {'$'}{totalHedgedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Coverage
                        </Typography>
                        <Typography variant="h6" fontWeight="medium">
                            {hedgedPercent.toFixed(1)}%
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Positions
                        </Typography>
                        <Typography variant="h6" fontWeight="medium">
                            {positions.length}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )
}
