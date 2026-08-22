'use client'

import { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { Chart, LineSeries, Pane, TimeScale, TimeScaleFitContentTrigger } from 'lightweight-charts-react-components'
import { useColorScheme } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import { grey, blue } from '@mui/material/colors'
import { getOptionHistoricalOhlc, OptionOhlcRow } from '@/lib/mzDataService'
import { buildOptionContractId, OptionPriceHistoryParams } from '@/lib/optionPriceHistory'
import { PutCallType } from '@/lib/types'
import { HedgeLeg } from '@/lib/hedgeAlgorithm'

type HedgeStrategyChartProps = {
    legs: HedgeLeg[];
    symbol: string;
}

type LegOhlcData = {
    legIndex: number;
    data: OptionOhlcRow[];
}

const fetchLegOhlc = async (leg: HedgeLeg, symbol: string): Promise<OptionOhlcRow[]> => {
    const params: OptionPriceHistoryParams = {
        symbol,
        expiration: leg.expiration,
        strike: leg.strike,
        putCallType: leg.type === 'PUT' ? PutCallType.PUT : PutCallType.CALL,
    }
    const contractId = buildOptionContractId(params)
    return getOptionHistoricalOhlc(contractId, 1000)
}

const calculateNetValue = (legData: LegOhlcData[], legs: HedgeLeg[]): { time: string; value: number }[] => {
    // Only include timestamps where ALL legs have data
    const legTimeSets = legData.map(ld => new Set(ld.data.map(r => r.dt)))
    const commonTimes = legTimeSets.reduce((acc, set) => {
        if (acc === null) return set
        return new Set([...acc].filter(t => set.has(t)))
    }, null as Set<string> | null)

    if (!commonTimes || commonTimes.size === 0) return []

    const timestampMap = new Map<string, number>()

    for (const ld of legData) {
        const leg = legs[ld.legIndex]
        if (!leg) continue

        const multiplier = leg.mode === 'BUY' ? 1 : -1

        for (const row of ld.data) {
            if (!commonTimes.has(row.dt)) continue
            const current = timestampMap.get(row.dt) || 0
            timestampMap.set(row.dt, current + (row.close * multiplier))
        }
    }

    return Array.from(timestampMap.entries())
        .map(([time, value]) => ({ time, value }))
        .sort((a, b) => a.time.localeCompare(b.time))
}

export const HedgeStrategyChart = ({ legs, symbol }: HedgeStrategyChartProps) => {
    const [chartData, setChartData] = useState<{ time: string; value: number }[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const theme = useTheme()
    const { mode: colorMode } = useColorScheme()
    const isDarkMode = colorMode === 'dark'

    const mainColor = isDarkMode ? theme.palette.grey[200] : theme.palette.grey[900]
    const lineColor = isDarkMode ? blue[300] : blue[700]

    useEffect(() => {
        if (legs.length === 0) {
            setChartData([])
            return
        }

        let cancelled = false
        setLoading(true)
        setError(null)

        Promise.all(legs.map(leg => fetchLegOhlc(leg, symbol)))
            .then(results => {
                if (cancelled) return
                const legData = results.map((data, i) => ({ legIndex: i, data }))
                const netValues = calculateNetValue(legData, legs)
                setChartData(netValues)
                setLoading(false)
            })
            .catch(err => {
                if (cancelled) return
                setError(err.message || 'Failed to fetch chart data')
                setLoading(false)
            })

        return () => { cancelled = true }
    }, [legs, symbol])

    const chartMemoData = useMemo(() => chartData.map(d => ({ time: d.time, value: d.value })), [chartData])

    const chartOptions = useMemo(() => ({
        autoSize: true,
        layout: {
            fontFamily: 'Inter, Roboto, sans-serif',
            attributionLogo: false,
            background: { color: 'transparent' },
            textColor: mainColor,
        },
        grid: {
            vertLines: { visible: false },
            horzLines: { color: isDarkMode ? grey[800] : grey[200] },
        },
        crosshair: {
            vertLine: { style: 3, color: mainColor },
            horzLine: { style: 3, color: mainColor },
        },
        rightPriceScale: {
            scaleMargins: { top: 0.1, bottom: 0.1 },
        },
    }), [mainColor, isDarkMode])

    const lineOptions = useMemo(() => ({
        color: lineColor,
        lineWidth: 2 as const,
        priceLineVisible: false,
    }), [lineColor])

    if (loading) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Loading chart data...</Typography>
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="error.main">{error}</Typography>
            </Box>
        )
    }

    if (chartData.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No chart data available</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ width: '100%', height: 200 }}>
            <Chart
                options={chartOptions}
                containerProps={{ style: { height: '100%' } }}
            >
                <Pane>
                    <LineSeries
                        data={chartMemoData}
                        options={lineOptions}
                    />
                </Pane>
                <TimeScale>
                    <TimeScaleFitContentTrigger deps={[chartData]} />
                </TimeScale>
            </Chart>
        </Box>
    )
}
